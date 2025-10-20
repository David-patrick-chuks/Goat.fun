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

        // Build default split in memory (60/30/10)
        IMarketPair.SplitConfig memory defaultSplit = IMarketPair.SplitConfig({
            potShare: 6000,
            holderDividendShare: 3000,
            reserveShare: 1000,
            creatorFeeShare: 0
        });

        // Deploy MarketFactory
        console.log("\n=== Deploying MarketFactory ===");
        MarketFactory factory = new MarketFactory(DEFAULT_CREATOR_FEE, defaultSplit);
        console.log("MarketFactory deployed at:", address(factory));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("SimpleOracle:", address(oracle));
        console.log("MarketFactory:", address(factory));
        console.log("Default Creator Fee:", DEFAULT_CREATOR_FEE, "basis points (2%)");
        console.log("Default Split Config:");
        console.log("  Pot Share:", defaultSplit.potShare, "basis points (60%)");
        console.log("  Holder Dividend Share:", defaultSplit.holderDividendShare, "basis points (30%)");
        console.log("  Reserve Share:", defaultSplit.reserveShare, "basis points (10%)");
        console.log("  Creator Fee Share:", defaultSplit.creatorFeeShare, "basis points (0%)");

        // Verify contracts
        console.log("\n=== Verification ===");
        console.log("Oracle owner:", oracle.owner());
        console.log("Factory owner:", factory.owner());
        console.log("Factory market count:", factory.getMarketCount());
    }
}
