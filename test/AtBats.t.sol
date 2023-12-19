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
    Outcome,
    AtBatOutcome
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

contract FullcountTest_joinAtBatSession is FullcountTestBase {
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

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();
        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

        vm.startPrank(player2);

        // vm.expectEmit(address(game));
        // emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Batter);
        game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, "");

        vm.stopPrank();

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

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();
        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

        vm.startPrank(player2);

        // vm.expectEmit(address(game));
        // emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Batter);
        game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, "");

        vm.stopPrank();

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.batterNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.batterNFT.tokenID, tokenID);
        assertEq(atBat.pitcherNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, otherTokenID);
    }

    // function testRevert_if_joining_session_that_is_part_of_an_at_bat() public {
    //     charactersMinted++;
    //     uint256 tokenID = charactersMinted;

    //     otherCharactersMinted++;
    //     uint256 otherTokenID = otherCharactersMinted;

    //     characterNFTs.mint(player1, tokenID);
    //     otherCharacterNFTs.mint(player2, otherTokenID);

    //     uint256 initialNumSessions = game.NumSessions();
    //     uint256 initialNumAtBats = game.NumAtBats();

    //     vm.startPrank(player1);

    //     // Check for startAtBat event
    //     // vm.expectEmit(address(game));
    //     // emit SessionStarted(initialNumSessions + 1, address(characterNFTs), tokenID, PlayerType.Pitcher);
    //     uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Pitcher, false);

    //     vm.stopPrank();

    //     uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

    //     vm.startPrank(player2);

    //     // vm.expectEmit(address(game));
    //     // emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Batter);
    //     vm.expectRevert("Fullcount.joinSession: cannot directly join session that is part of an AtBat");
    //     game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, "");

    //     vm.stopPrank();

    //     uint256 terminalNumSessions = game.NumSessions();
    //     uint256 terminalNumAtBats = game.NumAtBats();

    //     assertEq(terminalNumSessions, initialNumSessions + 1);
    //     assertEq(terminalNumAtBats, initialNumAtBats + 1);

    //     AtBat memory atBat = game.getAtBat(atBatID);
    //     assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
    //     assertEq(atBat.pitcherNFT.tokenID, tokenID);
    //     assertEq(atBat.batterNFT.nftAddress, address(0));
    //     assertEq(atBat.batterNFT.tokenID, 0);
    // }
}

contract FullcountTest_ballsAndStrikes is FullcountTestBase {
    uint256 AtBatID;
    address PitcherNFTAddress;
    uint256 PitcherTokenID;
    address BatterNFTAddress;
    uint256 BatterTokenID;

    function setUp() public virtual override {
        super.setUp();

        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Pitcher, false);

        vm.stopPrank();

        uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

        vm.startPrank(player2);

        otherCharacterNFTs.approve(address(game), otherTokenID);

        game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, "");

        vm.stopPrank();

        AtBatID = atBatID;
        PitcherNFTAddress = address(characterNFTs);
        PitcherTokenID = tokenID;
        BatterNFTAddress = address(otherCharacterNFTs);
        BatterTokenID = otherTokenID;
    }

    function _strikeSession(uint256 sessionID) internal {
        Pitch memory pitch = Pitch(1, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.InsideStrike);
        _commitPitch(sessionID, player1, player1PrivateKey, pitch);

        Swing memory swing = Swing(1, SwingType.Take, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitSwing(sessionID, player2, player2PrivateKey, swing);

        _revealPitch(sessionID, player1, pitch);
        _revealSwing(sessionID, player2, swing);
    }

    function _ballSession(uint256 sessionID) internal {
        Pitch memory pitch = Pitch(1, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.InsideBall);
        _commitPitch(sessionID, player1, player1PrivateKey, pitch);

        Swing memory swing = Swing(1, SwingType.Take, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitSwing(sessionID, player2, player2PrivateKey, swing);

        _revealSwing(sessionID, player2, swing);
        _revealPitch(sessionID, player1, pitch);
    }

    function _foulSession(uint256 sessionID) internal {
        // From Resolutinos test file
        Pitch memory pitch = Pitch(
            8_896_391_875_205_613_932_298_229_962_938_938_694_841_002_446_457_628_837_939_997_515_662_919_318_336,
            PitchSpeed.Fast,
            VerticalLocation.Middle,
            HorizontalLocation.OutsideStrike
        );
        Swing memory swing = Swing(19_734, SwingType.Power, VerticalLocation.HighStrike, HorizontalLocation.Middle);

        _commitPitch(sessionID, player1, player1PrivateKey, pitch);
        _commitSwing(sessionID, player2, player2PrivateKey, swing);

        _revealPitch(sessionID, player1, pitch);
        _revealSwing(sessionID, player2, swing);
    }

    function test_new_session_begins_after_one_strike() public {
        AtBat memory atBat = game.getAtBat(AtBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, BatterTokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, PitcherTokenID);

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 1);
        uint256 firstSessionID = game.AtBatSessions(AtBatID, 0);
        assertEq(game.SessionAtBat(firstSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 0);

        _strikeSession(firstSessionID);
        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 1);
        assertEq(atBat.balls, 0);
    }

    function test_new_session_begins_after_one_ball() public {
        AtBat memory atBat = game.getAtBat(AtBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, BatterTokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, PitcherTokenID);

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 1);
        uint256 firstSessionID = game.AtBatSessions(AtBatID, 0);
        assertEq(game.SessionAtBat(firstSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 0);

        _ballSession(firstSessionID);

        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 1);
    }

    function test_three_strikes_is_a_strikeout() public {
        AtBat memory atBat = game.getAtBat(AtBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, BatterTokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, PitcherTokenID);

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 1);
        uint256 firstSessionID = game.AtBatSessions(AtBatID, 0);
        assertEq(game.SessionAtBat(firstSessionID), AtBatID);

        _strikeSession(firstSessionID);

        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);
        uint256 secondSessionID = game.AtBatSessions(AtBatID, 1);
        assertEq(game.SessionAtBat(secondSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 1);
        assertEq(atBat.balls, 0);

        _strikeSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 0);

        _strikeSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.Strikeout));
    }

    function test_four_balls_is_a_walk() public {
        AtBat memory atBat = game.getAtBat(AtBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, BatterTokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, PitcherTokenID);

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 1);
        uint256 firstSessionID = game.AtBatSessions(AtBatID, 0);
        assertEq(game.SessionAtBat(firstSessionID), AtBatID);

        _ballSession(firstSessionID);

        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);
        uint256 secondSessionID = game.AtBatSessions(AtBatID, 1);
        assertEq(game.SessionAtBat(secondSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 1);

        _ballSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 2);

        _ballSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 3);

        _ballSession(fourthSessionID);

        Session memory fourthSession = game.getSession(fourthSessionID);
        assertTrue(fourthSession.didPitcherReveal);
        assertTrue(fourthSession.didBatterReveal);
        assertEq(uint256(fourthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 3);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.Walk));
    }

    function test_full_count_then_strikeout() public {
        AtBat memory atBat = game.getAtBat(AtBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, BatterTokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, PitcherTokenID);

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 1);
        uint256 firstSessionID = game.AtBatSessions(AtBatID, 0);
        assertEq(game.SessionAtBat(firstSessionID), AtBatID);

        _ballSession(firstSessionID);

        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);
        uint256 secondSessionID = game.AtBatSessions(AtBatID, 1);
        assertEq(game.SessionAtBat(secondSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 1);

        _strikeSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 1);
        assertEq(atBat.balls, 1);

        _ballSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 1);
        assertEq(atBat.balls, 2);

        _strikeSession(fourthSessionID);

        Session memory fourthSession = game.getSession(fourthSessionID);
        assertTrue(fourthSession.didPitcherReveal);
        assertTrue(fourthSession.didBatterReveal);
        assertEq(uint256(fourthSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 5);
        uint256 fifthSessionID = game.AtBatSessions(AtBatID, 4);
        assertEq(game.SessionAtBat(fifthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 2);

        _ballSession(fifthSessionID);

        Session memory fifthSession = game.getSession(fifthSessionID);
        assertTrue(fifthSession.didPitcherReveal);
        assertTrue(fifthSession.didBatterReveal);
        assertEq(uint256(fifthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);
        uint256 sixthSessionID = game.AtBatSessions(AtBatID, 5);
        assertEq(game.SessionAtBat(sixthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 3);

        _strikeSession(sixthSessionID);

        Session memory sixthSession = game.getSession(sixthSessionID);
        assertTrue(sixthSession.didPitcherReveal);
        assertTrue(sixthSession.didBatterReveal);
        assertEq(uint256(sixthSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 3);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.Strikeout));
    }

    function test_full_count_then_walk() public {
        AtBat memory atBat = game.getAtBat(AtBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, BatterTokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, PitcherTokenID);

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 1);
        uint256 firstSessionID = game.AtBatSessions(AtBatID, 0);
        assertEq(game.SessionAtBat(firstSessionID), AtBatID);

        _ballSession(firstSessionID);

        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);
        uint256 secondSessionID = game.AtBatSessions(AtBatID, 1);
        assertEq(game.SessionAtBat(secondSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 1);

        _strikeSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 1);
        assertEq(atBat.balls, 1);

        _ballSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 1);
        assertEq(atBat.balls, 2);

        _strikeSession(fourthSessionID);

        Session memory fourthSession = game.getSession(fourthSessionID);
        assertTrue(fourthSession.didPitcherReveal);
        assertTrue(fourthSession.didBatterReveal);
        assertEq(uint256(fourthSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 5);
        uint256 fifthSessionID = game.AtBatSessions(AtBatID, 4);
        assertEq(game.SessionAtBat(fifthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 2);

        _ballSession(fifthSessionID);

        Session memory fifthSession = game.getSession(fifthSessionID);
        assertTrue(fifthSession.didPitcherReveal);
        assertTrue(fifthSession.didBatterReveal);
        assertEq(uint256(fifthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);
        uint256 sixthSessionID = game.AtBatSessions(AtBatID, 5);
        assertEq(game.SessionAtBat(sixthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 3);

        _ballSession(sixthSessionID);

        Session memory sixthSession = game.getSession(sixthSessionID);
        assertTrue(sixthSession.didPitcherReveal);
        assertTrue(sixthSession.didBatterReveal);
        assertEq(uint256(sixthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 3);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.Walk));
    }

    function test_full_count_then_double() public {
        AtBat memory atBat = game.getAtBat(AtBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, BatterTokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, PitcherTokenID);

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 1);
        uint256 firstSessionID = game.AtBatSessions(AtBatID, 0);
        assertEq(game.SessionAtBat(firstSessionID), AtBatID);

        _ballSession(firstSessionID);

        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);
        uint256 secondSessionID = game.AtBatSessions(AtBatID, 1);
        assertEq(game.SessionAtBat(secondSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 1);

        _strikeSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 1);
        assertEq(atBat.balls, 1);

        _ballSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 1);
        assertEq(atBat.balls, 2);

        _strikeSession(fourthSessionID);

        Session memory fourthSession = game.getSession(fourthSessionID);
        assertTrue(fourthSession.didPitcherReveal);
        assertTrue(fourthSession.didBatterReveal);
        assertEq(uint256(fourthSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 5);
        uint256 fifthSessionID = game.AtBatSessions(AtBatID, 4);
        assertEq(game.SessionAtBat(fifthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 2);

        _ballSession(fifthSessionID);

        Session memory fifthSession = game.getSession(fifthSessionID);
        assertTrue(fifthSession.didPitcherReveal);
        assertTrue(fifthSession.didBatterReveal);
        assertEq(uint256(fifthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);
        uint256 sixthSessionID = game.AtBatSessions(AtBatID, 5);
        assertEq(game.SessionAtBat(sixthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 3);

        // Generates a double
        Pitch memory pitch = Pitch(
            57_761_167_149_431_627_567_619_636_552_548_080_695_738_090_550_175_245_247_314_135_192_585_439_073_298,
            PitchSpeed.Slow,
            VerticalLocation.LowBall,
            HorizontalLocation.OutsideStrike
        );
        Swing memory swing = Swing(10_508, SwingType.Power, VerticalLocation.LowBall, HorizontalLocation.OutsideBall);

        _commitPitch(sixthSessionID, player1, player1PrivateKey, pitch);
        _commitSwing(sixthSessionID, player2, player2PrivateKey, swing);

        _revealPitch(sixthSessionID, player1, pitch);
        _revealSwing(sixthSessionID, player2, swing);

        Session memory sixthSession = game.getSession(sixthSessionID);
        assertTrue(sixthSession.didPitcherReveal);
        assertTrue(sixthSession.didBatterReveal);
        assertEq(uint256(sixthSession.outcome), uint256(Outcome.Double));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 3);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.Double));
    }

    function test_foul_is_a_strike_with_less_than_two_strikes_and_nothing_with_two_strikes() public {
        AtBat memory atBat = game.getAtBat(AtBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, BatterTokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, PitcherTokenID);

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 1);
        uint256 firstSessionID = game.AtBatSessions(AtBatID, 0);
        assertEq(game.SessionAtBat(firstSessionID), AtBatID);

        _foulSession(firstSessionID);

        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Foul));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);
        uint256 secondSessionID = game.AtBatSessions(AtBatID, 1);
        assertEq(game.SessionAtBat(secondSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 1);
        assertEq(atBat.balls, 0);

        _foulSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Foul));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 0);

        _foulSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Foul));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.strikes, 2);
        assertEq(atBat.balls, 0);
    }
}

contract FullcountTest_atBatInviteOnly is FullcountTestBase {
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

        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Batter, true);

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();
        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

        bytes32 sessionHash = game.sessionHash(firstSessionID);
        bytes memory signature = signMessageHash(player1PrivateKey, sessionHash);

        vm.startPrank(player2);

        game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, signature);

        vm.stopPrank();

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.batterNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.batterNFT.tokenID, tokenID);
        assertEq(atBat.pitcherNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, otherTokenID);
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

        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Pitcher, true);

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();
        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

        bytes32 sessionHash = game.sessionHash(firstSessionID);
        bytes memory signature = signMessageHash(player1PrivateKey, sessionHash);

        vm.startPrank(player2);

        game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, signature);

        vm.stopPrank();

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, tokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, otherTokenID);
    }

    function testRevert_if_wrong_signer() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        vm.startPrank(player1);

        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Pitcher, true);

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();
        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

        bytes32 sessionHash = game.sessionHash(firstSessionID);
        bytes memory signature = signMessageHash(player2PrivateKey, sessionHash);

        vm.startPrank(player2);

        vm.expectRevert("Fullcount.joinSession: invalid signature in session requiring signature to join.");
        game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, signature);

        vm.stopPrank();

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, tokenID);
        assertEq(atBat.batterNFT.nftAddress, address(0));
        assertEq(atBat.batterNFT.tokenID, 0);
    }

    function testRevert_if_invalid_signature() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        uint256 startJoinOffsetSeconds = 5;

        vm.startPrank(player1);

        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Pitcher, true);

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();
        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

        bytes32 sessionHash = game.sessionHash(12_345);
        bytes memory signature = signMessageHash(player1PrivateKey, sessionHash);

        vm.startPrank(player2);

        vm.expectRevert("Fullcount.joinSession: invalid signature in session requiring signature to join.");
        game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, signature);

        vm.stopPrank();

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, tokenID);
        assertEq(atBat.batterNFT.nftAddress, address(0));
        assertEq(atBat.batterNFT.tokenID, 0);
    }
}
