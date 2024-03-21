// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test } from "../lib/forge-std/src/Test.sol";
import { BeerLeagueBallers } from "../src/Players.sol";
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

contract PlayersTestBase is Test {
    BeerLeagueBallers players;
    MockERC1155 terminus;

    uint256 adminPrivateKey = 0x1;
    uint256 player1PrivateKey = 0x101;
    uint256 player2PrivateKey = 0x102;
    uint256 randomPersonPrivateKey = 0x201;

    address admin = vm.addr(adminPrivateKey);
    address player1 = vm.addr(player1PrivateKey);
    address player2 = vm.addr(player2PrivateKey);
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
        uint256 initialImageCount = players.NumProfileImages();

        vm.prank(admin);
        players.addProfileImage("http://www.example.com");

        assertEq(players.NumProfileImages(), initialImageCount + 1);
    }

    function test_non_admin_cannot_add_profile_image() public {
        uint256 initialImageCount = players.NumProfileImages();

        vm.prank(randomPerson);
        vm.expectRevert("BeerLeagueBallers._enforceIsAdmin: not admin");
        players.addProfileImage("http://www.example.com");

        assertEq(players.NumProfileImages(), initialImageCount);
    }

    function test_admin_can_set_profile_image() public {
        uint256 index = 1;
        string memory initialImage = players.ProfileImages(index);

        vm.prank(admin);
        players.updateProfileImage(index, "http://www.example.com");

        assertEq(players.ProfileImages(index), "http://www.example.com");
        assertNotEq(players.ProfileImages(index), initialImage);
    }

    function test_non_admin_cannot_set_profile_image() public {
        uint256 index = 1;
        string memory initialImage = players.ProfileImages(index);

        vm.prank(randomPerson);
        vm.expectRevert("BeerLeagueBallers._enforceIsAdmin: not admin");
        players.updateProfileImage(index, "http://www.example.com");

        assertEq(players.ProfileImages(index), initialImage);
        assertNotEq(players.ProfileImages(index), "http://www.example.com");
    }

    function test_admin_can_set_token_name_and_images() public {
        string memory firstOffensiveName = "Offensive Bunny";
        string memory secondOffensiveName = "Explitive Bunny";
        uint256 firstTokenImageIndex = 0;
        uint256 secondTokenImageIndex = 5;

        vm.prank(player1);
        uint256 firstTokenID = players.mint(firstOffensiveName, firstTokenImageIndex);

        vm.prank(player2);
        uint256 secondTokenID = players.mint(secondOffensiveName, secondTokenImageIndex);

        assertEq(players.Name(firstTokenID), firstOffensiveName);
        assertEq(players.Name(secondTokenID), secondOffensiveName);
        assertEq(players.ImageIndex(firstTokenID), firstTokenImageIndex);
        assertEq(players.ImageIndex(secondTokenID), secondTokenImageIndex);

        string memory adminName = "Fluffy Bunny";
        uint256 adminImageIndex = 2;

        uint256[] memory tokenList = new uint256[](2);
        tokenList[0] = firstTokenID;
        tokenList[1] = secondTokenID;

        string[] memory nameList = new string[](2);
        nameList[0] = adminName;
        nameList[1] = adminName;

        uint256[] memory imageIndexList = new uint256[](2);
        imageIndexList[0] = adminImageIndex;
        imageIndexList[1] = adminImageIndex;

        vm.startPrank(admin);

        players.setTokenNames(tokenList, nameList);

        players.setTokenImages(tokenList, imageIndexList);

        vm.stopPrank();

        assertEq(players.Name(firstTokenID), adminName);
        assertEq(players.Name(secondTokenID), adminName);
        assertEq(players.ImageIndex(firstTokenID), adminImageIndex);
        assertEq(players.ImageIndex(secondTokenID), adminImageIndex);
    }

    function test_non_admin_cannot_set_token_name_or_images() public {
        string memory firstOffensiveName = "Offensive Bunny";
        string memory secondOffensiveName = "Explitive Bunny";
        uint256 firstTokenImageIndex = 1;
        uint256 secondTokenImageIndex = 3;

        vm.prank(player1);
        uint256 firstTokenID = players.mint(firstOffensiveName, firstTokenImageIndex);

        vm.prank(player2);
        uint256 secondTokenID = players.mint(secondOffensiveName, secondTokenImageIndex);

        assertEq(players.Name(firstTokenID), firstOffensiveName);
        assertEq(players.Name(secondTokenID), secondOffensiveName);
        assertEq(players.ImageIndex(firstTokenID), firstTokenImageIndex);
        assertEq(players.ImageIndex(secondTokenID), secondTokenImageIndex);

        string memory randomName = "Random Bunny";
        uint256 randomImageIndex = 7;

        uint256[] memory tokenList = new uint256[](2);
        tokenList[0] = firstTokenID;
        tokenList[1] = secondTokenID;

        string[] memory nameList = new string[](2);
        nameList[0] = randomName;
        nameList[1] = randomName;

        uint256[] memory imageIndexList = new uint256[](2);
        imageIndexList[0] = randomImageIndex;
        imageIndexList[1] = randomImageIndex;

        vm.startPrank(randomPerson);

        vm.expectRevert("BeerLeagueBallers._enforceIsAdmin: not admin");
        players.setTokenNames(tokenList, nameList);

        vm.expectRevert("BeerLeagueBallers._enforceIsAdmin: not admin");
        players.setTokenImages(tokenList, imageIndexList);

        vm.stopPrank();

        assertEq(players.Name(firstTokenID), firstOffensiveName);
        assertEq(players.Name(secondTokenID), secondOffensiveName);
        assertEq(players.ImageIndex(firstTokenID), firstTokenImageIndex);
        assertEq(players.ImageIndex(secondTokenID), secondTokenImageIndex);
    }
}
