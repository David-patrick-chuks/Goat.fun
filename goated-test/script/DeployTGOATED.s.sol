// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {tGOATED} from "src/tGOATED.sol";

/// @notice Foundry script to deploy the tGOATED ERC20 test token.
contract DeployTGOATED is Script {
    function run() external returns (tGOATED token) {
        // Use the private key from env when broadcasting (e.g., ANVIL/SEPOLIA)
        // Example: forge script script/DeployTGOATED.s.sol:DeployTGOATED --broadcast --rpc-url <RPC> --private-key <KEY>
        vm.startBroadcast();
        token = new tGOATED();
        vm.stopBroadcast();

        console2.log("tGOATED deployed at:", address(token));
        console2.log("Owner:", token.owner());
        console2.log("Owner balance:", token.balanceOf(token.owner()));
    }
}


