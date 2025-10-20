// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/MarketFactory.sol";
import "../src/SimpleOracle.sol";

/**
 * @title CreateTestMarket
 * @notice Script to create a test market for GoatFun
 * @dev Creates a sample market using the deployed factory
 */
contract CreateTestMarket is Script {
    /// @notice Test market parameters
    string constant MARKET_TITLE = "Bitcoin Price Prediction";
    string constant MARKET_TICKER = "BTCWIN";
    uint256 constant DURATION_HOURS = 24; // 24 hours
    uint256 constant BASE_PRICE_BULLISH = 1e18; // 1 token per share
    uint256 constant INCREMENT_BULLISH = 1e15;   // 0.001 token increment
    uint256 constant BASE_PRICE_FADE = 1e18;      // 1 token per share
    uint256 constant INCREMENT_FADE = 1e15;       // 0.001 token increment
    uint256 constant CREATOR_FEE_PERCENT = 200;   // 2%

    /// @notice Test split configuration
    IMarketPair.SplitConfig constant TEST_SPLIT = IMarketPair.SplitConfig({
        potShare: 6000,           // 60%
        holderDividendShare: 3000, // 30%
        reserveShare: 1000,        // 10%
        creatorFeeShare: 0         // 0% (creator fee handled separately)
    });

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get contract addresses from environment or use defaults
        address factoryAddress = vm.envOr("MARKET_FACTORY_ADDRESS", address(0));
        address tokenAddress = vm.envOr("TOKEN_ADDRESS", address(0));
        
        require(factoryAddress != address(0), "MARKET_FACTORY_ADDRESS not set");
        require(tokenAddress != address(0), "TOKEN_ADDRESS not set");

        console.log("Creating test market...");
        console.log("Deployer address:", deployer);
        console.log("Factory address:", factoryAddress);
        console.log("Token address:", tokenAddress);

        vm.startBroadcast(deployerPrivateKey);

        MarketFactory factory = MarketFactory(factoryAddress);

        // Create the market
        console.log("\n=== Creating Test Market ===");
        console.log("Title:", MARKET_TITLE);
        console.log("Ticker:", MARKET_TICKER);
        console.log("Duration:", DURATION_HOURS, "hours");
        console.log("Creator Fee:", CREATOR_FEE_PERCENT, "basis points");

        (address marketAddress, bytes32 marketId) = factory.createMarket(
            MARKET_TITLE,
            MARKET_TICKER,
            DURATION_HOURS,
            BASE_PRICE_BULLISH,
            INCREMENT_BULLISH,
            BASE_PRICE_FADE,
            INCREMENT_FADE,
            tokenAddress,
            deployer, // Creator
            CREATOR_FEE_PERCENT,
            TEST_SPLIT
        );

        vm.stopBroadcast();

        // Log market details
        console.log("\n=== Market Created ===");
        console.log("Market Address:", marketAddress);
        console.log("Market ID:", vm.toString(marketId));
        
        // Get market info
        IMarketPair market = IMarketPair(marketAddress);
        IMarketPair.MarketInfo memory info = market.getMarketInfo();
        
        console.log("\n=== Market Info ===");
        console.log("Title:", info.title);
        console.log("Ticker:", info.ticker);
        console.log("Creator:", info.creator);
        console.log("Token:", info.token);
        console.log("Start Time:", info.startTime);
        console.log("End Time:", info.endTime);
        console.log("Duration:", info.durationHours, "hours");
        console.log("Resolved:", info.resolved);
        console.log("Result:", uint256(info.result));

        // Get side info
        (uint256 bullishNetShares, uint256 bullishTotalSupply, uint256 bullishBasePrice, uint256 bullishIncrement) = 
            market.getSideInfo(IMarketPair.Side.Bullish);
        (uint256 fadeNetShares, uint256 fadeTotalSupply, uint256 fadeBasePrice, uint256 fadeIncrement) = 
            market.getSideInfo(IMarketPair.Side.Fade);

        console.log("\n=== Side Info ===");
        console.log("Bullish Side:");
        console.log("  Net Shares:", bullishNetShares);
        console.log("  Total Supply:", bullishTotalSupply);
        console.log("  Base Price:", bullishBasePrice);
        console.log("  Increment:", bullishIncrement);
        
        console.log("Fade Side:");
        console.log("  Net Shares:", fadeNetShares);
        console.log("  Total Supply:", fadeTotalSupply);
        console.log("  Base Price:", fadeBasePrice);
        console.log("  Increment:", fadeIncrement);

        // Get current prices
        uint256 bullishPrice = market.getCurrentPrice(IMarketPair.Side.Bullish);
        uint256 fadePrice = market.getCurrentPrice(IMarketPair.Side.Fade);

        console.log("\n=== Current Prices ===");
        console.log("Bullish Price:", bullishPrice);
        console.log("Fade Price:", fadePrice);

        console.log("\n=== Next Steps ===");
        console.log("1. Approve tokens to market:", marketAddress);
        console.log("2. Call buy() function to purchase shares");
        console.log("3. Use oracle to resolve market after duration");
        console.log("4. Claim payouts for winners");
    }
}
