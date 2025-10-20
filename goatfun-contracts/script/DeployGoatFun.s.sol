// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/MarketFactory.sol";
import "../src/SimpleOracle.sol";

/**
 * @title DeployGoatFun
 * @notice Deployment script for GoatFun contracts on GOAT Testnet3
 * @dev Deploys MarketFactory and SimpleOracle contracts
 */
contract DeployGoatFun is Script {
    /// @notice Default split configuration (60% pot, 30% holders, 10% reserve)
    IMarketPair.SplitConfig constant DEFAULT_SPLIT = IMarketPair.SplitConfig({
        potShare: 6000,           // 60%
        holderDividendShare: 3000, // 30%
        reserveShare: 1000,        // 10%
        creatorFeeShare: 0         // 0% (can be set per market)
    });

    /// @notice Default creator fee (2%)
    uint256 constant DEFAULT_CREATOR_FEE = 200; // 2%

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying GoatFun contracts...");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SimpleOracle
        console.log("\n=== Deploying SimpleOracle ===");
        SimpleOracle oracle = new SimpleOracle();
        console.log("SimpleOracle deployed at:", address(oracle));

        // Deploy MarketFactory
        console.log("\n=== Deploying MarketFactory ===");
        MarketFactory factory = new MarketFactory(
            DEFAULT_CREATOR_FEE,
            DEFAULT_SPLIT
        );
        console.log("MarketFactory deployed at:", address(factory));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("SimpleOracle:", address(oracle));
        console.log("MarketFactory:", address(factory));
        console.log("Default Creator Fee:", DEFAULT_CREATOR_FEE, "basis points (2%)");
        console.log("Default Split Config:");
        console.log("  Pot Share:", DEFAULT_SPLIT.potShare, "basis points (60%)");
        console.log("  Holder Dividend Share:", DEFAULT_SPLIT.holderDividendShare, "basis points (30%)");
        console.log("  Reserve Share:", DEFAULT_SPLIT.reserveShare, "basis points (10%)");
        console.log("  Creator Fee Share:", DEFAULT_SPLIT.creatorFeeShare, "basis points (0%)");

        // Verify contracts
        console.log("\n=== Verification ===");
        console.log("Oracle owner:", oracle.owner());
        console.log("Factory owner:", factory.owner());
        console.log("Factory market count:", factory.getMarketCount());
    }
}
