// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {tGOATED} from "src/tGOATED.sol";

contract TGoatedTest is Test {
    tGOATED private token;
    address private owner;
    address private alice = address(0xA11CE);

    function setUp() public {
        owner = address(this);
        token = new tGOATED();
        // Ownership in tGOATED defaults to msg.sender (address(this))
    }

    function test_Metadata() public {
        assertEq(token.name(), "Goated Test Token");
        assertEq(token.symbol(), "tGOATED");
        assertEq(token.decimals(), 18);
    }

    function test_InitialSupplyAssignedToOwner() public {
        uint256 expected = 1_000_000 * 10 ** token.decimals();
        assertEq(token.totalSupply(), expected);
        assertEq(token.balanceOf(owner), expected);
    }

    function testOnlyOwnerCanMint() public {
        uint256 amount = 1_000 * 10 ** token.decimals();

        // Non-owner cannot mint
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        token.mint(alice, amount);

        // Owner can mint
        token.mint(alice, amount);
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.totalSupply(), (1_000_000 * 10 ** token.decimals()) + amount);
    }
}


