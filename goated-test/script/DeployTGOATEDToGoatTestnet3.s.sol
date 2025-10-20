// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {tGOATED} from "src/tGOATED.sol";

/// @notice Foundry script to deploy the tGOATED ERC20 test token to GOAT Testnet3.
contract DeployTGOATEDToGoatTestnet3 is Script {
    function run() external returns (tGOATED token) {
        // Use the private key from env when broadcasting to GOAT Testnet3
        // Example: forge script script/DeployTGOATEDToGoatTestnet3.s.sol:DeployTGOATEDToGoatTestnet3 --broadcast --rpc-url goat_testnet3 --private-key $PRIVATE_KEY
        vm.startBroadcast();
        token = new tGOATED();
        vm.stopBroadcast();

        console2.log("=== tGOATED Deployment to GOAT Testnet3 ===");
        console2.log("Contract deployed at:", address(token));
        console2.log("Owner:", token.owner());
        console2.log("Owner balance:", token.balanceOf(token.owner()));
        console2.log("Token name:", token.name());
        console2.log("Token symbol:", token.symbol());
        console2.log("Total supply:", token.totalSupply());
        console2.log("==========================================");
    }
}
