// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/MarketFactory.sol";
import "../src/MarketPair.sol";
import "../src/SimpleOracle.sol";
import "../src/utils/PriceMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestToken
 * @notice Simple ERC20 token for testing
 */
contract TestToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/**
 * @title GoatFunTest
 * @notice Comprehensive test suite for GoatFun contracts
 */
contract GoatFunTest is Test {
    MarketFactory public factory;
    SimpleOracle public oracle;
    TestToken public token;
    MarketPair public market;
    
    address public owner;
    address public creator;
    address public buyer1;
    address public buyer2;
    address public buyer3;
    
    bytes32 public marketId;
    
    // Test parameters
    string constant MARKET_TITLE = "Test Market";
    string constant MARKET_TICKER = "TEST";
    uint256 constant DURATION_HOURS = 24;
    uint256 constant BASE_PRICE = 1e18; // 1 token per share
    uint256 constant INCREMENT = 1e15;  // 0.001 token increment
    uint256 constant CREATOR_FEE = 200; // 2%
    
    IMarketPair.SplitConfig internal splitConfig;

    event MarketCreated(address indexed market, address indexed creator, bytes32 indexed marketId, string title, string ticker);
    event Buy(address indexed buyer, IMarketPair.Side indexed side, uint256 sharesBought, uint256 amountSpent, uint256 newPrice);
    event Sell(address indexed seller, IMarketPair.Side indexed side, uint256 sharesSold, uint256 refundAmount, uint256 newPrice);

    function setUp() public {
        owner = address(this);
        creator = makeAddr("creator");
        buyer1 = makeAddr("buyer1");
        buyer2 = makeAddr("buyer2");
        buyer3 = makeAddr("buyer3");
        
        // Deploy contracts
        oracle = new SimpleOracle();
        splitConfig = IMarketPair.SplitConfig({
            potShare: 6000,
            holderDividendShare: 3000,
            reserveShare: 1000,
            creatorFeeShare: 0
        });
        factory = new MarketFactory(CREATOR_FEE, splitConfig);
        token = new TestToken("Test Token", "TEST");
        
        // Distribute tokens
        token.transfer(creator, 100000 * 10**18);
        token.transfer(buyer1, 100000 * 10**18);
        token.transfer(buyer2, 100000 * 10**18);
        token.transfer(buyer3, 100000 * 10**18);
        
        // Create a test market
        vm.prank(creator);
        (address marketAddress, bytes32 _marketId) = factory.createMarket(
            MARKET_TITLE,
            MARKET_TICKER,
            DURATION_HOURS,
            BASE_PRICE,
            INCREMENT,
            BASE_PRICE,
            INCREMENT,
            address(token),
            creator,
            CREATOR_FEE,
            splitConfig
        );
        
        market = MarketPair(marketAddress);
        marketId = _marketId;
        
        // Authorize oracle for the market
        oracle.authorizeOracle(address(market), address(oracle));
    }

    function testMarketCreation() public {
        // Verify market was created
        assertTrue(factory.isValidMarket(address(market)));
        assertEq(factory.getMarketCount(), 1);
        assertEq(factory.getMarketById(marketId), address(market));
        
        // Verify market info
        IMarketPair.MarketInfo memory info = market.getMarketInfo();
        assertEq(info.title, MARKET_TITLE);
        assertEq(info.ticker, MARKET_TICKER);
        assertEq(info.creator, creator);
        assertEq(info.token, address(token));
        assertEq(info.durationHours, DURATION_HOURS);
        assertFalse(info.resolved);
        assertEq(uint256(info.result), 0); // None
        
        // Verify side info
        (uint256 bullishNetShares, uint256 bullishTotalSupply, uint256 bullishBasePrice, uint256 bullishIncrement) = 
            market.getSideInfo(IMarketPair.Side.Bullish);
        (uint256 fadeNetShares, uint256 fadeTotalSupply, uint256 fadeBasePrice, uint256 fadeIncrement) = 
            market.getSideInfo(IMarketPair.Side.Fade);
        
        assertEq(bullishNetShares, 0);
        assertEq(bullishTotalSupply, 0);
        assertEq(bullishBasePrice, BASE_PRICE);
        assertEq(bullishIncrement, INCREMENT);
        
        assertEq(fadeNetShares, 0);
        assertEq(fadeTotalSupply, 0);
        assertEq(fadeBasePrice, BASE_PRICE);
        assertEq(fadeIncrement, INCREMENT);
    }

    function testBuyShares() public {
        uint256 buyAmount = 100 * 10**18; // 100 tokens
        
        // Approve tokens
        vm.prank(buyer1);
        token.approve(address(market), buyAmount);
        
        // Buy bullish shares
        vm.prank(buyer1);
        (uint256 sharesBought, uint256 actualSpent) = market.buy(IMarketPair.Side.Bullish, buyAmount);
        
        // Verify purchase
        assertTrue(sharesBought > 0);
        assertTrue(actualSpent > 0);
        assertEq(market.getBalance(buyer1, IMarketPair.Side.Bullish), sharesBought);
        
        // Verify side data updated
        (uint256 netShares, uint256 totalSupply,,) = market.getSideInfo(IMarketPair.Side.Bullish);
        assertEq(netShares, sharesBought);
        assertEq(totalSupply, sharesBought);
        
        // Verify balances distributed
        (uint256 potBalance, uint256 reserveBalance, uint256 creatorRevenue) = market.getBalances();
        assertTrue(potBalance > 0);
        assertTrue(reserveBalance > 0);
        assertTrue(creatorRevenue > 0);
    }

    function testSellShares() public {
        uint256 buyAmount = 100 * 10**18;
        
        // Buy shares first
        vm.prank(buyer1);
        token.approve(address(market), buyAmount);
        vm.prank(buyer1);
        (uint256 sharesBought,) = market.buy(IMarketPair.Side.Bullish, buyAmount);
        
        uint256 initialBalance = token.balanceOf(buyer1);
        
        // Sell half the shares
        uint256 sharesToSell = sharesBought / 2;
        vm.prank(buyer1);
        uint256 refundAmount = market.sell(IMarketPair.Side.Bullish, sharesToSell);
        
        // Verify refund
        assertTrue(refundAmount > 0);
        assertEq(token.balanceOf(buyer1), initialBalance + refundAmount);
        assertEq(market.getBalance(buyer1, IMarketPair.Side.Bullish), sharesBought - sharesToSell);
        
        // Verify side data updated
        (uint256 netShares, uint256 totalSupply,,) = market.getSideInfo(IMarketPair.Side.Bullish);
        assertEq(netShares, sharesBought - sharesToSell);
        assertEq(totalSupply, sharesBought - sharesToSell);
    }

    function testDividendDistribution() public {
        uint256 buyAmount = 100 * 10**18;
        
        // First buyer buys shares
        vm.prank(buyer1);
        token.approve(address(market), buyAmount);
        vm.prank(buyer1);
        (uint256 shares1,) = market.buy(IMarketPair.Side.Bullish, buyAmount);
        
        // Second buyer buys shares (should generate dividends for first buyer)
        vm.prank(buyer2);
        token.approve(address(market), buyAmount);
        vm.prank(buyer2);
        market.buy(IMarketPair.Side.Bullish, buyAmount);
        
        // Check accumulated dividend for first buyer
        uint256 dividend = market.getAccumulatedDividend(buyer1, IMarketPair.Side.Bullish);
        assertTrue(dividend > 0);
        
        // Claim dividend
        uint256 initialBalance = token.balanceOf(buyer1);
        vm.prank(buyer1);
        uint256 claimedDividend = market.claimDividend(IMarketPair.Side.Bullish);
        
        assertEq(claimedDividend, dividend);
        assertEq(token.balanceOf(buyer1), initialBalance + claimedDividend);
    }

    function testMarketResolution() public {
        uint256 buyAmount = 100 * 10**18;
        
        // Buy shares on both sides
        vm.prank(buyer1);
        token.approve(address(market), buyAmount);
        vm.prank(buyer1);
        market.buy(IMarketPair.Side.Bullish, buyAmount);
        
        vm.prank(buyer2);
        token.approve(address(market), buyAmount);
        vm.prank(buyer2);
        market.buy(IMarketPair.Side.Fade, buyAmount);
        
        // Resolve market (bullish wins)
        vm.prank(address(oracle));
        market.resolve(IMarketOracle.MarketResult.Bullish);
        
        // Verify resolution
        IMarketPair.MarketInfo memory info = market.getMarketInfo();
        assertTrue(info.resolved);
        assertEq(uint256(info.result), 1); // Bullish
        
        // Claim payout for winner
        uint256 initialBalance = token.balanceOf(buyer1);
        vm.prank(buyer1);
        uint256 payout = market.claimPayout(IMarketPair.Side.Bullish);
        
        assertTrue(payout > 0);
        assertEq(token.balanceOf(buyer1), initialBalance + payout);
        assertEq(market.getBalance(buyer1, IMarketPair.Side.Bullish), 0); // Shares burned
    }

    function testCreatorRevenue() public {
        uint256 buyAmount = 100 * 10**18;
        
        // Buy shares to generate creator revenue
        vm.prank(buyer1);
        token.approve(address(market), buyAmount);
        vm.prank(buyer1);
        market.buy(IMarketPair.Side.Bullish, buyAmount);
        
        // Check creator revenue
        (,, uint256 creatorRevenue) = market.getBalances();
        assertTrue(creatorRevenue > 0);
        
        // Advance time to end market
        vm.warp(block.timestamp + DURATION_HOURS * 3600 + 1);
        
        // Withdraw creator revenue
        uint256 initialBalance = token.balanceOf(creator);
        vm.prank(creator);
        uint256 withdrawnRevenue = market.withdrawCreatorRevenue();
        
        assertEq(withdrawnRevenue, creatorRevenue);
        assertEq(token.balanceOf(creator), initialBalance + withdrawnRevenue);
    }

    function testPriceMath() public {
        // Test PriceMath library functions
        uint256 currentShares = 100;
        uint256 sharesToBuy = 10;
        uint256 basePrice = 1e18;
        uint256 increment = 1e15;
        
        uint256 cost = PriceMath.costToBuyFrom(currentShares, sharesToBuy, basePrice, increment);
        assertTrue(cost > 0);
        
        uint256 refund = PriceMath.refundOnSell(currentShares, sharesToBuy, basePrice, increment);
        assertTrue(refund > 0);
        
        uint256 maxShares = PriceMath.maxSharesBuyable(currentShares, cost, basePrice, increment);
        assertEq(maxShares, sharesToBuy);
        
        uint256 marginalPrice = PriceMath.getMarginalPrice(currentShares, basePrice, increment);
        assertTrue(marginalPrice > basePrice);
    }

    function testMultipleBuysAndSells() public {
        uint256 buyAmount = 50 * 10**18;
        
        // Multiple buyers buy shares
        for (uint256 i = 0; i < 3; i++) {
            address buyer = i == 0 ? buyer1 : (i == 1 ? buyer2 : buyer3);
            vm.prank(buyer);
            token.approve(address(market), buyAmount);
            vm.prank(buyer);
            market.buy(IMarketPair.Side.Bullish, buyAmount);
        }
        
        // Verify total supply
        (uint256 netShares, uint256 totalSupply,,) = market.getSideInfo(IMarketPair.Side.Bullish);
        assertTrue(totalSupply > 0);
        assertEq(netShares, totalSupply);
        
        // Some sellers sell shares
        vm.prank(buyer1);
        uint256 sharesToSell = market.getBalance(buyer1, IMarketPair.Side.Bullish) / 2;
        vm.prank(buyer1);
        market.sell(IMarketPair.Side.Bullish, sharesToSell);
        
        // Verify updated supply
        (netShares, totalSupply,,) = market.getSideInfo(IMarketPair.Side.Bullish);
        assertTrue(totalSupply > 0);
        assertEq(netShares, totalSupply);
    }

    function testEdgeCases() public {
        // Test buying with insufficient balance
        vm.prank(buyer1);
        token.approve(address(market), 1);
        vm.prank(buyer1);
        vm.expectRevert();
        market.buy(IMarketPair.Side.Bullish, 100 * 10**18);
        
        // Test selling more shares than owned
        vm.prank(buyer1);
        token.approve(address(market), 100 * 10**18);
        vm.prank(buyer1);
        market.buy(IMarketPair.Side.Bullish, 100 * 10**18);
        
        vm.prank(buyer1);
        vm.expectRevert();
        market.sell(IMarketPair.Side.Bullish, 200 * 10**18);
        
        // Test resolving before market ends
        vm.prank(address(oracle));
        vm.expectRevert();
        market.resolve(IMarketOracle.MarketResult.Bullish);
    }

    function testPauseAndUnpause() public {
        // Pause market
        vm.prank(creator);
        market.pause();
        
        // Try to buy while paused
        vm.prank(buyer1);
        token.approve(address(market), 100 * 10**18);
        vm.prank(buyer1);
        vm.expectRevert();
        market.buy(IMarketPair.Side.Bullish, 100 * 10**18);
        
        // Unpause market
        vm.prank(creator);
        market.unpause();
        
        // Should work now
        vm.prank(buyer1);
        market.buy(IMarketPair.Side.Bullish, 100 * 10**18);
    }

    function testFactoryFunctions() public {
        // Test factory view functions
        assertEq(factory.getMarketCount(), 1);
        assertTrue(factory.isValidMarket(address(market)));
        
        // Test getting markets by creator
        address[] memory creatorMarkets = factory.getMarketsByCreator(creator);
        assertEq(creatorMarkets.length, 1);
        assertEq(creatorMarkets[0], address(market));
        
        // Test getting markets by token
        address[] memory tokenMarkets = factory.getMarketsByToken(address(token));
        assertEq(tokenMarkets.length, 1);
        assertEq(tokenMarkets[0], address(market));
        
        // Test getting active markets
        address[] memory activeMkts = factory.getActiveMarkets();
        assertEq(activeMkts.length, 1);
        assertEq(activeMkts[0], address(market));
        
        // Test market stats
        (uint256 totalMarkets, uint256 numActive, uint256 resolvedMarkets, uint256 expiredMarkets) = 
            factory.getMarketStats();
        assertEq(totalMarkets, 1);
        assertEq(numActive, 1);
        assertEq(resolvedMarkets, 0);
        assertEq(expiredMarkets, 0);
    }
}
