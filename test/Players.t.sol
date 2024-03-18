// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test } from "../lib/forge-std/src/Test.sol";
import { console2 as console } from "../lib/forge-std/src/console2.sol";
import { BeerLeagueBallers } from "../src/Players.sol";
// import { TerminusFacet } from "../lib/web3/contracts/terminus/TerminusFacet.sol";
import "@openzeppelin-contracts/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract MockERC1155 is ERC1155Burnable {
    constructor() ERC1155("lol://lol") { }

    function mint(address to, uint256 id, uint256 amount, bytes memory data) public virtual {
        _mint(to, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public virtual {
        _mintBatch(to, ids, amounts, data);
    }
}

// contract MockTerminus is TerminusFacet {
//     constructor() { }
// }

contract PlayersTestBase is Test {
    BeerLeagueBallers players;
    MockERC1155 terminus;

    uint256 adminPrivateKey = 0x1;
    uint256 playerPrivateKey = 0x2;
    uint256 randomPersonPrivateKey = 0x77;

    address admin = vm.addr(adminPrivateKey);
    address player = vm.addr(playerPrivateKey);
    address randomPerson = vm.addr(randomPersonPrivateKey);

    uint256 adminPoolID = 1;

    function setUp() public virtual {
        terminus = new MockERC1155();
        terminus.mint(address(admin), adminPoolID, 1, "");

        players = new BeerLeagueBallers(address(terminus), 1);
    }
}

contract PlayersTestAdmin is PlayersTestBase {
    function test_admin_can_add_profile_image() public {
        uint256 initialImageCount = players.getProfileImageCount();

        vm.prank(admin);
        players.addProfileImage("http://www.example.com");

        assertEq(players.getProfileImageCount(), initialImageCount + 1);
    }

    function test_non_admin_cannot_add_profile_image() public {
        uint256 initialImageCount = players.getProfileImageCount();

        vm.prank(randomPerson);
        vm.expectRevert("BeerLeagueBallers._enforceIsAdmin: not admin");
        players.addProfileImage("http://www.example.com");

        assertEq(players.getProfileImageCount(), initialImageCount);
    }

    function test_admin_can_set_profile_image() public {
        uint256 index = 1;
        string memory initialImage = players.ProfileImages(index);

        vm.prank(admin);
        players.setProfileImage(index, "http://www.example.com");

        assertEq(players.ProfileImages(index), "http://www.example.com");
        assertNotEq(players.ProfileImages(index), initialImage);
    }

    function test_non_admin_cannot_set_profile_image() public {
        uint256 index = 1;
        string memory initialImage = players.ProfileImages(index);

        vm.prank(randomPerson);
        vm.expectRevert("BeerLeagueBallers._enforceIsAdmin: not admin");
        players.setProfileImage(index, "http://www.example.com");

        assertEq(players.ProfileImages(index), initialImage);
        assertNotEq(players.ProfileImages(index), "http://www.example.com");
    }

    function test_admin_can_set_token_name() public {
        string memory playerName = "Offensive Bunny";

        vm.prank(player);
        uint256 tokenID = players.mint(playerName, 0);

        assertEq(players.Name(tokenID), playerName);

        string memory adminName = "Fluffy Bunny";

        vm.prank(admin);
        players.setTokenName(tokenID, adminName);

        assertEq(players.Name(tokenID), adminName);
    }

    function test_non_admin_cannot_set_token_name() public {
        string memory playerName = "Offensive Bunny";

        vm.prank(player);
        uint256 tokenID = players.mint(playerName, 0);

        assertEq(players.Name(tokenID), playerName);

        string memory randomName = "Random Bunny";

        vm.prank(randomPerson);
        vm.expectRevert("BeerLeagueBallers._enforceIsAdmin: not admin");
        players.setTokenName(tokenID, randomName);

        assertEq(players.Name(tokenID), playerName);
    }
}
