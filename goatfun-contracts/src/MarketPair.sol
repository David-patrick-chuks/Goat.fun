// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../interfaces/IMarketPair.sol";
import "../interfaces/IMarketOracle.sol";
import "../utils/PriceMath.sol";

/**
 * @title MarketPair
 * @notice Individual market contract managing Bullish and Fade tokens
 * @dev Implements bonding curves, dividend distribution, and resolution mechanics
 */
contract MarketPair is IMarketPair, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using PriceMath for uint256;

    /// @notice Market information
    MarketInfo public marketInfo;
    
    /// @notice Side-specific data structures
    struct SideData {
        uint256 netShares;                    // Current net shares sold
        uint256 totalSupply;                  // Current total supply
        uint256 basePrice;                    // Base price per share
        uint256 increment;                    // Price increment per share
        uint256 cumulativeDividendPerShare;   // Cumulative dividend per share (1e18 scale)
        mapping(address => uint256) balances; // Share balances per address
        mapping(address => uint256) dividendCreditedTo; // Last credited dividend per address
    }

    /// @notice Side data for Bullish and Fade
    mapping(Side => SideData) public sides;
    
    /// @notice Contract balances
    uint256 public potBalance;           // Main pot for winners
    uint256 public reserveBalance;      // Reserve for solvency
    uint256 public creatorRevenue;      // Creator's accumulated revenue
    
    /// @notice Market state
    bool public marketEnded;
    bool public claimsEnabled;
    
    /// @notice Events
    event MarketCreated(
        address indexed market,
        address indexed creator,
        string title,
        string ticker,
        uint256 durationHours
    );
    
    event Buy(
        address indexed buyer,
        Side indexed side,
        uint256 sharesBought,
        uint256 amountSpent,
        uint256 newPrice
    );
    
    event Sell(
        address indexed seller,
        Side indexed side,
        uint256 sharesSold,
        uint256 refundAmount,
        uint256 newPrice
    );
    
    event DividendPaid(
        address indexed holder,
        Side indexed side,
        uint256 dividendAmount
    );
    
    event MarketResolved(
        address indexed market,
        IMarketOracle.MarketResult result,
        PayoutMode payoutMode
    );
    
    event PayoutClaimed(
        address indexed claimer,
        Side indexed side,
        uint256 sharesBurned,
        uint256 payoutAmount
    );
    
    event CreatorWithdrawn(
        address indexed creator,
        uint256 revenueAmount
    );

    /// @notice Modifiers
    modifier onlyActiveMarket() {
        require(!marketEnded, "Market has ended");
        require(block.timestamp < marketInfo.endTime, "Market time expired");
        _;
    }

    modifier onlyResolvedMarket() {
        require(marketEnded, "Market not resolved");
        _;
    }

    modifier onlyClaimsPhase() {
        require(claimsEnabled, "Claims not enabled");
        _;
    }

    /**
     * @notice Initialize the market
     * @param _title Market title
     * @param _ticker Market ticker
     * @param _durationHours Market duration in hours
     * @param _basePriceBullish Base price for bullish side
     * @param _incrementBullish Price increment for bullish side
     * @param _basePriceFade Base price for fade side
     * @param _incrementFade Price increment for fade side
     * @param _tokenAddress ERC20 token address
     * @param _creatorAddress Market creator
     * @param _creatorFeePercent Creator fee percentage (basis points)
     * @param _splitConfig Revenue split configuration
     */
    constructor(
        string memory _title,
        string memory _ticker,
        uint256 _durationHours,
        uint256 _basePriceBullish,
        uint256 _incrementBullish,
        uint256 _basePriceFade,
        uint256 _incrementFade,
        address _tokenAddress,
        address _creatorAddress,
        uint256 _creatorFeePercent,
        SplitConfig memory _splitConfig
    ) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_ticker).length > 0, "Ticker required");
        require(_durationHours > 0, "Duration must be positive");
        require(_tokenAddress != address(0), "Invalid token address");
        require(_creatorAddress != address(0), "Invalid creator address");
        require(_creatorFeePercent <= 10000, "Creator fee too high");
        require(_splitConfig.potShare + _splitConfig.holderDividendShare + 
                _splitConfig.reserveShare + _splitConfig.creatorFeeShare == 10000, 
                "Split must sum to 100%");

        // Validate price parameters
        require(PriceMath.validatePriceParams(_basePriceBullish, _incrementBullish), 
                "Invalid bullish price params");
        require(PriceMath.validatePriceParams(_basePriceFade, _incrementFade), 
                "Invalid fade price params");

        // Set market info
        marketInfo = MarketInfo({
            title: _title,
            ticker: _ticker,
            creator: _creatorAddress,
            token: _tokenAddress,
            startTime: block.timestamp,
            endTime: block.timestamp + (_durationHours * 1 hours),
            durationHours: _durationHours,
            resolved: false,
            result: IMarketOracle.MarketResult.None,
            payoutMode: PayoutMode.ProRata, // Default to safe pro-rata mode
            splitConfig: _splitConfig
        });

        // Initialize sides
        sides[Side.Bullish] = SideData({
            netShares: 0,
            totalSupply: 0,
            basePrice: _basePriceBullish,
            increment: _incrementBullish,
            cumulativeDividendPerShare: 0
        });

        sides[Side.Fade] = SideData({
            netShares: 0,
            totalSupply: 0,
            basePrice: _basePriceFade,
            increment: _incrementFade,
            cumulativeDividendPerShare: 0
        });

        // Transfer ownership to creator
        _transferOwnership(_creatorAddress);

        emit MarketCreated(
            address(this),
            _creatorAddress,
            _title,
            _ticker,
            _durationHours
        );
    }

    /**
     * @notice Buy shares on a specific side
     * @param side The side to buy (Bullish or Fade)
     * @param maxSpent Maximum amount of tokens willing to spend
     * @return sharesBought Number of shares purchased
     * @return actualSpent Actual amount of tokens spent
     */
    function buy(Side side, uint256 maxSpent) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlyActiveMarket 
        returns (uint256 sharesBought, uint256 actualSpent) 
    {
        require(maxSpent > 0, "Max spent must be positive");
        
        SideData storage sideData = sides[side];
        
        // Calculate maximum shares buyable
        sharesBought = PriceMath.maxSharesBuyable(
            sideData.netShares,
            maxSpent,
            sideData.basePrice,
            sideData.increment
        );
        
        require(sharesBought > 0, "Cannot buy shares");
        
        // Calculate actual cost
        actualSpent = PriceMath.costToBuyFrom(
            sideData.netShares,
            sharesBought,
            sideData.basePrice,
            sideData.increment
        );
        
        // Transfer tokens from buyer
        IERC20(marketInfo.token).safeTransferFrom(msg.sender, address(this), actualSpent);
        
        // Distribute the spent amount according to split config
        _distributeBuyAmount(actualSpent, side);
        
        // Update side data
        sideData.netShares += sharesBought;
        sideData.totalSupply += sharesBought;
        sideData.balances[msg.sender] += sharesBought;
        
        // Claim any pending dividends for the buyer
        _claimDividendInternal(msg.sender, side);
        
        emit Buy(
            msg.sender,
            side,
            sharesBought,
            actualSpent,
            PriceMath.getMarginalPrice(sideData.netShares, sideData.basePrice, sideData.increment)
        );
    }

    /**
     * @notice Sell shares back to the contract
     * @param side The side to sell shares from
     * @param shares Number of shares to sell
     * @return refundAmount Amount of tokens received
     */
    function sell(Side side, uint256 shares) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlyActiveMarket 
        returns (uint256 refundAmount) 
    {
        require(shares > 0, "Shares must be positive");
        
        SideData storage sideData = sides[side];
        require(sideData.balances[msg.sender] >= shares, "Insufficient shares");
        
        // Calculate refund amount
        refundAmount = PriceMath.refundOnSell(
            sideData.netShares,
            shares,
            sideData.basePrice,
            sideData.increment
        );
        
        // Ensure contract has sufficient funds
        require(potBalance + reserveBalance >= refundAmount, "Insufficient contract funds");
        
        // Claim any pending dividends first
        _claimDividendInternal(msg.sender, side);
        
        // Update side data
        sideData.balances[msg.sender] -= shares;
        sideData.totalSupply -= shares;
        sideData.netShares -= shares;
        
        // Pay refund from reserve first, then pot
        if (reserveBalance >= refundAmount) {
            reserveBalance -= refundAmount;
        } else {
            uint256 remainingRefund = refundAmount - reserveBalance;
            reserveBalance = 0;
            potBalance -= remainingRefund;
        }
        
        // Transfer refund to seller
        IERC20(marketInfo.token).safeTransfer(msg.sender, refundAmount);
        
        emit Sell(
            msg.sender,
            side,
            shares,
            refundAmount,
            PriceMath.getMarginalPrice(sideData.netShares, sideData.basePrice, sideData.increment)
        );
    }

    /**
     * @notice Claim accumulated dividends for a side
     * @param side The side to claim dividends from
     * @return dividendAmount Amount of tokens claimed
     */
    function claimDividend(Side side) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        returns (uint256 dividendAmount) 
    {
        return _claimDividendInternal(msg.sender, side);
    }

    /**
     * @notice Claim payout after market resolution (winners only)
     * @param side The winning side
     * @return payoutAmount Amount of tokens received
     */
    function claimPayout(Side side) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlyResolvedMarket 
        onlyClaimsPhase 
        returns (uint256 payoutAmount) 
    {
        require(marketInfo.result != IMarketOracle.MarketResult.None, "Market not resolved");
        require(
            (side == Side.Bullish && marketInfo.result == IMarketOracle.MarketResult.Bullish) ||
            (side == Side.Fade && marketInfo.result == IMarketOracle.MarketResult.Fade),
            "Not winning side"
        );
        
        SideData storage sideData = sides[side];
        uint256 userShares = sideData.balances[msg.sender];
        require(userShares > 0, "No shares to claim");
        
        if (marketInfo.payoutMode == PayoutMode.ProRata) {
            // Pro-rata distribution from pot
            payoutAmount = (potBalance * userShares) / sideData.totalSupply;
        } else {
            // Curve redemption mode - check if solvent
            uint256 curvePayout = PriceMath.refundOnSell(
                sideData.netShares,
                userShares,
                sideData.basePrice,
                sideData.increment
            );
            
            if (potBalance + reserveBalance >= curvePayout) {
                payoutAmount = curvePayout;
                // Deduct from reserve first, then pot
                if (reserveBalance >= payoutAmount) {
                    reserveBalance -= payoutAmount;
                } else {
                    uint256 remainingPayout = payoutAmount - reserveBalance;
                    reserveBalance = 0;
                    potBalance -= remainingPayout;
                }
            } else {
                // Fallback to pro-rata if not solvent
                payoutAmount = (potBalance * userShares) / sideData.totalSupply;
            }
        }
        
        // Burn shares
        sideData.balances[msg.sender] -= userShares;
        sideData.totalSupply -= userShares;
        
        // Transfer payout
        IERC20(marketInfo.token).safeTransfer(msg.sender, payoutAmount);
        
        emit PayoutClaimed(msg.sender, side, userShares, payoutAmount);
    }

    /**
     * @notice Withdraw creator revenue
     * @return revenueAmount Amount of tokens withdrawn
     */
    function withdrawCreatorRevenue() 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        returns (uint256 revenueAmount) 
    {
        require(msg.sender == marketInfo.creator, "Only creator can withdraw");
        require(marketEnded, "Market must be ended");
        
        revenueAmount = creatorRevenue;
        require(revenueAmount > 0, "No revenue to withdraw");
        
        creatorRevenue = 0;
        IERC20(marketInfo.token).safeTransfer(msg.sender, revenueAmount);
        
        emit CreatorWithdrawn(msg.sender, revenueAmount);
    }

    /**
     * @notice Resolve the market (only authorized oracle or owner)
     * @param result The oracle's determination of the winner
     */
    function resolve(IMarketOracle.MarketResult result) external {
        require(
            msg.sender == owner() || 
            (address(this).code.length > 0 && IMarketOracle(msg.sender).isAuthorizedOracle(address(this), msg.sender)),
            "Not authorized to resolve"
        );
        require(result != IMarketOracle.MarketResult.None, "Invalid result");
        require(!marketEnded, "Already resolved");
        
        marketInfo.resolved = true;
        marketInfo.result = result;
        marketEnded = true;
        claimsEnabled = true;
        
        emit MarketResolved(address(this), result, marketInfo.payoutMode);
    }

    /**
     * @notice Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency refund all holders (only when paused)
     */
    function emergencyRefundAll() external onlyOwner whenPaused {
        require(marketEnded, "Market must be ended");
        
        // This would require iterating over all holders, which is gas-intensive
        // In practice, this should be called only in extreme circumstances
        // and holders should be notified to claim their refunds individually
        revert("Use individual refunds to avoid gas limits");
    }

    // View functions

    function getCurrentPrice(Side side) external view override returns (uint256 price) {
        SideData storage sideData = sides[side];
        return PriceMath.getMarginalPrice(sideData.netShares, sideData.basePrice, sideData.increment);
    }

    function getCostForShares(Side side, uint256 shares) external view override returns (uint256 cost) {
        SideData storage sideData = sides[side];
        return PriceMath.costToBuyFrom(sideData.netShares, shares, sideData.basePrice, sideData.increment);
    }

    function getMaxSharesBuyable(Side side, uint256 budget) external view override returns (uint256 maxShares) {
        SideData storage sideData = sides[side];
        return PriceMath.maxSharesBuyable(sideData.netShares, budget, sideData.basePrice, sideData.increment);
    }

    function getAccumulatedDividend(address account, Side side) external view override returns (uint256 dividendAmount) {
        SideData storage sideData = sides[side];
        uint256 userShares = sideData.balances[account];
        if (userShares == 0) return 0;
        
        uint256 totalDividend = (sideData.cumulativeDividendPerShare * userShares) / PriceMath.SCALE;
        uint256 creditedDividend = sideData.dividendCreditedTo[account];
        
        return totalDividend > creditedDividend ? totalDividend - creditedDividend : 0;
    }

    function getMarketInfo() external view override returns (MarketInfo memory info) {
        return marketInfo;
    }

    function getSideInfo(Side side) external view override returns (
        uint256 netShares,
        uint256 totalSupply,
        uint256 basePrice,
        uint256 increment
    ) {
        SideData storage sideData = sides[side];
        return (sideData.netShares, sideData.totalSupply, sideData.basePrice, sideData.increment);
    }

    function getBalance(address account, Side side) external view override returns (uint256 balance) {
        return sides[side].balances[account];
    }

    function getBalances() external view override returns (
        uint256 potBalance_,
        uint256 reserveBalance_,
        uint256 creatorRevenue_
    ) {
        return (potBalance, reserveBalance, creatorRevenue);
    }

    // Internal functions

    /**
     * @notice Distribute buy amount according to split configuration
     * @param amount Total amount to distribute
     * @param side The side being bought
     */
    function _distributeBuyAmount(uint256 amount, Side side) internal {
        SplitConfig memory config = marketInfo.splitConfig;
        
        // Calculate amounts for each bucket
        uint256 potAmount = (amount * config.potShare) / 10000;
        uint256 holderDividendAmount = (amount * config.holderDividendShare) / 10000;
        uint256 reserveAmount = (amount * config.reserveShare) / 10000;
        uint256 creatorFeeAmount = (amount * config.creatorFeeShare) / 10000;
        
        // Update balances
        potBalance += potAmount;
        reserveBalance += reserveAmount;
        creatorRevenue += creatorFeeAmount;
        
        // Distribute holder dividends
        _distributeHolderDividend(holderDividendAmount, side);
    }

    /**
     * @notice Distribute holder dividends using cumulative dividend approach
     * @param dividendAmount Amount to distribute
     * @param side The side receiving dividends
     */
    function _distributeHolderDividend(uint256 dividendAmount, Side side) internal {
        SideData storage sideData = sides[side];
        
        if (sideData.totalSupply == 0) {
            // No holders, add to pot
            potBalance += dividendAmount;
        } else {
            // Add to cumulative dividend per share
            sideData.cumulativeDividendPerShare += (dividendAmount * PriceMath.SCALE) / sideData.totalSupply;
        }
    }

    /**
     * @notice Internal function to claim dividends
     * @param account Account to claim for
     * @param side Side to claim from
     * @return dividendAmount Amount claimed
     */
    function _claimDividendInternal(address account, Side side) internal returns (uint256 dividendAmount) {
        SideData storage sideData = sides[side];
        uint256 userShares = sideData.balances[account];
        
        if (userShares == 0) return 0;
        
        uint256 totalDividend = (sideData.cumulativeDividendPerShare * userShares) / PriceMath.SCALE;
        uint256 creditedDividend = sideData.dividendCreditedTo[account];
        
        if (totalDividend > creditedDividend) {
            dividendAmount = totalDividend - creditedDividend;
            sideData.dividendCreditedTo[account] = totalDividend;
            
            // Transfer dividend
            IERC20(marketInfo.token).safeTransfer(account, dividendAmount);
            
            emit DividendPaid(account, side, dividendAmount);
        }
        
        return dividendAmount;
    }
}
