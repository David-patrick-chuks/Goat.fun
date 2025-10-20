// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IMarketOracle.sol";

/**
 * @title IMarketPair
 * @notice Interface for individual market contracts
 * @dev Each market manages two sides: Bullish and Fade tokens
 */
interface IMarketPair {
    enum Side {
        Bullish, // 0
        Fade     // 1
    }

    enum PayoutMode {
        ProRata,      // 0 - Distribute pot pro-rata among winners (default, safe)
        CurveRedemption // 1 - Allow redemption at final curve price if solvent
    }

    struct SplitConfig {
        uint256 potShare;           // Percentage of buy amount going to pot (basis points)
        uint256 holderDividendShare; // Percentage going to existing holders (basis points)
        uint256 reserveShare;       // Percentage going to reserve (basis points)
        uint256 creatorFeeShare;    // Percentage going to creator (basis points)
    }

    struct MarketInfo {
        string title;
        string ticker;
        address creator;
        address token;
        uint256 startTime;
        uint256 endTime;
        uint256 durationHours;
        bool resolved;
        IMarketOracle.MarketResult result;
        PayoutMode payoutMode;
        SplitConfig splitConfig;
    }

    /**
     * @notice Buy shares on a specific side
     * @param side The side to buy (Bullish or Fade)
     * @param maxSpent Maximum amount of tokens willing to spend
     * @return sharesBought Number of shares purchased
     * @return actualSpent Actual amount of tokens spent
     */
    function buy(Side side, uint256 maxSpent) external returns (uint256 sharesBought, uint256 actualSpent);

    /**
     * @notice Sell shares back to the contract
     * @param side The side to sell shares from
     * @param shares Number of shares to sell
     * @return refundAmount Amount of tokens received
     */
    function sell(Side side, uint256 shares) external returns (uint256 refundAmount);

    /**
     * @notice Claim accumulated dividends for a side
     * @param side The side to claim dividends from
     * @return dividendAmount Amount of tokens claimed
     */
    function claimDividend(Side side) external returns (uint256 dividendAmount);

    /**
     * @notice Claim payout after market resolution (winners only)
     * @param side The winning side
     * @return payoutAmount Amount of tokens received
     */
    function claimPayout(Side side) external returns (uint256 payoutAmount);

    /**
     * @notice Withdraw creator revenue
     * @return revenueAmount Amount of tokens withdrawn
     */
    function withdrawCreatorRevenue() external returns (uint256 revenueAmount);

    /**
     * @notice Get current price for buying one share on a side
     * @param side The side to get price for
     * @return price Current marginal price per share
     */
    function getCurrentPrice(Side side) external view returns (uint256 price);

    /**
     * @notice Get estimated cost for buying a specific number of shares
     * @param side The side to buy from
     * @param shares Number of shares to buy
     * @return cost Total cost for the shares
     */
    function getCostForShares(Side side, uint256 shares) external view returns (uint256 cost);

    /**
     * @notice Get maximum shares buyable with given budget
     * @param side The side to buy from
     * @param budget Maximum tokens to spend
     * @return maxShares Maximum shares that can be bought
     */
    function getMaxSharesBuyable(Side side, uint256 budget) external view returns (uint256 maxShares);

    /**
     * @notice Get accumulated dividends for an address on a side
     * @param account Address to check dividends for
     * @param side The side to check
     * @return dividendAmount Accumulated dividend amount
     */
    function getAccumulatedDividend(address account, Side side) external view returns (uint256 dividendAmount);

    /**
     * @notice Get market information
     * @return info Market information struct
     */
    function getMarketInfo() external view returns (MarketInfo memory info);

    /**
     * @notice Get side information
     * @param side The side to get info for
     * @return netShares Current net shares sold
     * @return totalSupply Current total supply
     * @return basePrice Base price for the side
     * @return increment Price increment per share
     */
    function getSideInfo(Side side) external view returns (
        uint256 netShares,
        uint256 totalSupply,
        uint256 basePrice,
        uint256 increment
    );

    /**
     * @notice Get balance of shares for an address on a side
     * @param account Address to check balance for
     * @param side The side to check
     * @return balance Number of shares held
     */
    function getBalance(address account, Side side) external view returns (uint256 balance);

    /**
     * @notice Get contract balances
     * @return potBalance Current pot balance
     * @return reserveBalance Current reserve balance
     * @return creatorRevenue Current creator revenue balance
     */
    function getBalances() external view returns (
        uint256 potBalance,
        uint256 reserveBalance,
        uint256 creatorRevenue
    );
}
