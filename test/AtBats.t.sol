// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console2 } from "../lib/forge-std/src/Test.sol";
import { FullcountTestBase } from "./Fullcount.t.sol";
import { Fullcount } from "../src/Fullcount.sol";
import {
    PlayerType,
    Session,
    AtBat,
    Pitch,
    Swing,
    PitchSpeed,
    SwingType,
    VerticalLocation,
    HorizontalLocation,
    Outcome
} from "../src/data.sol";

contract FullcountTest_startAtBat is FullcountTestBase {
    function test_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        vm.startPrank(player1);

        // Check for startAtBat event
        // vm.expectEmit(address(game));
        // emit SessionStarted(initialNumSessions + 1, address(characterNFTs), tokenID, PlayerType.Pitcher);
        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Pitcher, false);

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();

        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, tokenID);
        assertEq(atBat.batterNFT.nftAddress, address(0));
        assertEq(atBat.batterNFT.tokenID, 0);
    }

    function test_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        vm.startPrank(player1);

        // Check for startAtBat event
        // vm.expectEmit(address(game));
        // emit SessionStarted(initialNumSessions + 1, address(characterNFTs), tokenID, PlayerType.Pitcher);
        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Batter, false);

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();

        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.batterNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.batterNFT.tokenID, tokenID);
        assertEq(atBat.pitcherNFT.nftAddress, address(0));
        assertEq(atBat.pitcherNFT.tokenID, 0);
    }
}

contract FullcountTest_joinAtBat is FullcountTestBase {
    function test_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        vm.startPrank(player1);

        // Check for startAtBat event
        // vm.expectEmit(address(game));
        // emit SessionStarted(initialNumSessions + 1, address(characterNFTs), tokenID, PlayerType.Pitcher);
        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Pitcher, false);

        vm.stopPrank();

        vm.startPrank(player2);

        // vm.expectEmit(address(game));
        // emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Batter);
        game.joinAtBat(atBatID, address(otherCharacterNFTs), otherTokenID, "");

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();

        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, tokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, otherTokenID);
    }

    function test_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        vm.startPrank(player1);

        // Check for startAtBat event
        // vm.expectEmit(address(game));
        // emit SessionStarted(initialNumSessions + 1, address(characterNFTs), tokenID, PlayerType.Pitcher);
        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Batter, false);

        vm.stopPrank();

        vm.startPrank(player2);

        // vm.expectEmit(address(game));
        // emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Batter);
        game.joinAtBat(atBatID, address(otherCharacterNFTs), otherTokenID, "");

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();

        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.batterNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.batterNFT.tokenID, tokenID);
        assertEq(atBat.pitcherNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, otherTokenID);
    }
}
