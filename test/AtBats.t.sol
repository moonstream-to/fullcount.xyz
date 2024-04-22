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

contract FullcountAtBatTest is FullcountTestBase {
    event AtBatStarted(
        uint256 indexed atBatID,
        address indexed nftAddress,
        uint256 indexed tokenID,
        uint256 firstSessionID,
        PlayerType role,
        bool requiresSignature
    );
    event AtBatJoined(
        uint256 indexed atBatID,
        address indexed nftAddress,
        uint256 indexed tokenID,
        uint256 firstSessionID,
        PlayerType role
    );
    event AtBatProgress(
        uint256 indexed atBatID,
        AtBatOutcome indexed outcome,
        uint256 balls,
        uint256 strikes,
        address pitcherAddress,
        uint256 pitcherTokenID,
        address batterAddress,
        uint256 batterTokenID
    );

    function _generateStrike() internal pure returns (Pitch memory, Swing memory) {
        Pitch memory pitch = Pitch(1, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.InsideStrike);

        Swing memory swing = Swing(1, SwingType.Take, VerticalLocation.Middle, HorizontalLocation.Middle);

        return (pitch, swing);
    }

    function _generateBall() internal pure returns (Pitch memory, Swing memory) {
        Pitch memory pitch = Pitch(1, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.InsideBall);

        Swing memory swing = Swing(1, SwingType.Take, VerticalLocation.Middle, HorizontalLocation.Middle);

        return (pitch, swing);
    }

    function _generateFoul() internal pure returns (Pitch memory, Swing memory) {
        Pitch memory pitch = Pitch(
            76_272_677_889_733_487_807_869_088_975_394_561_199_007_238_211_299_295_369_669_345_782_657_832_457_462,
            PitchSpeed.Slow,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        Swing memory swing = Swing(5027, SwingType.Contact, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        return (pitch, swing);
    }

    function _generateDouble() internal pure returns (Pitch memory, Swing memory) {
        Pitch memory pitch = Pitch(
            111_226_050_657_822_924_597_491_446_253_991_213_025_840_145_394_201_015_488_938_793_738_637_304_727_056,
            PitchSpeed.Slow,
            VerticalLocation.Middle,
            HorizontalLocation.InsideStrike
        );

        Swing memory swing = Swing(5682, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.OutsideStrike);

        return (pitch, swing);
    }

    function _generateHomeRun() internal pure returns (Pitch memory, Swing memory) {
        Pitch memory pitch = Pitch(
            70_742_784_270_056_657_581_884_307_797_108_841_089_344_138_257_779_225_355_304_684_713_507_588_495_343,
            PitchSpeed.Fast,
            VerticalLocation.HighBall,
            HorizontalLocation.OutsideStrike
        );

        Swing memory swing = Swing(6874, SwingType.Power, VerticalLocation.HighBall, HorizontalLocation.OutsideStrike);

        return (pitch, swing);
    }
}

contract FullcountTest_startAtBat is FullcountAtBatTest {
    function test_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        vm.startPrank(player1);

        vm.expectEmit(address(game));
        emit AtBatStarted(
            initialNumAtBats + 1, address(characterNFTs), tokenID, initialNumSessions + 1, PlayerType.Pitcher, false
        );
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
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));
    }

    function test_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        vm.startPrank(player1);

        vm.expectEmit(address(game));
        emit AtBatStarted(
            initialNumAtBats + 1, address(characterNFTs), tokenID, initialNumSessions + 1, PlayerType.Batter, false
        );
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
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));
    }
}

contract FullcountTest_joinAtBatSession is FullcountAtBatTest {
    function test_join_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        vm.startPrank(player1);

        vm.expectEmit(address(game));
        emit AtBatStarted(
            initialNumAtBats + 1, address(characterNFTs), tokenID, initialNumSessions + 1, PlayerType.Pitcher, false
        );
        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Pitcher, false);

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();
        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit AtBatJoined(atBatID, address(otherCharacterNFTs), otherTokenID, firstSessionID, PlayerType.Batter);
        game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, "");

        vm.stopPrank();

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, tokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, otherTokenID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));
    }

    function test_join_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        uint256 initialNumSessions = game.NumSessions();
        uint256 initialNumAtBats = game.NumAtBats();

        vm.startPrank(player1);

        vm.expectEmit(address(game));
        emit AtBatStarted(
            initialNumAtBats + 1, address(characterNFTs), tokenID, initialNumSessions + 1, PlayerType.Batter, false
        );
        uint256 atBatID = game.startAtBat(address(characterNFTs), tokenID, PlayerType.Batter, false);

        vm.stopPrank();

        uint256 terminalNumSessions = game.NumSessions();
        uint256 terminalNumAtBats = game.NumAtBats();
        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(terminalNumAtBats, initialNumAtBats + 1);

        uint256 firstSessionID = game.AtBatSessions(atBatID, 0);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit AtBatJoined(atBatID, address(otherCharacterNFTs), otherTokenID, firstSessionID, PlayerType.Pitcher);
        game.joinSession(firstSessionID, address(otherCharacterNFTs), otherTokenID, "");

        vm.stopPrank();

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.batterNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.batterNFT.tokenID, tokenID);
        assertEq(atBat.pitcherNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, otherTokenID);
        assertEq(atBat.strikes, 0);
        assertEq(atBat.balls, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));
    }
}

contract FullcountTest_ballsAndStrikes is FullcountAtBatTest {
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
        (Pitch memory strikePitch, Swing memory strikeSwing) = _generateStrike();

        _commitPitch(sessionID, player1, player1PrivateKey, strikePitch);
        _commitSwing(sessionID, player2, player2PrivateKey, strikeSwing);

        _revealPitch(sessionID, player1, strikePitch);
        _revealSwing(sessionID, player2, strikeSwing);
    }

    function _ballSession(uint256 sessionID) internal {
        (Pitch memory ballPitch, Swing memory ballSwing) = _generateBall();

        _commitPitch(sessionID, player1, player1PrivateKey, ballPitch);
        _commitSwing(sessionID, player2, player2PrivateKey, ballSwing);

        _revealSwing(sessionID, player2, ballSwing);
        _revealPitch(sessionID, player1, ballPitch);
    }

    function _foulSession(uint256 sessionID) internal {
        (Pitch memory foulPitch, Swing memory foulSwing) = _generateFoul();

        _commitPitch(sessionID, player1, player1PrivateKey, foulPitch);
        _commitSwing(sessionID, player2, player2PrivateKey, foulSwing);

        _revealPitch(sessionID, player1, foulPitch);
        _revealSwing(sessionID, player2, foulSwing);
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
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(firstSessionID);
        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));
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
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(firstSessionID);

        Session memory firstSession = game.getSession(firstSessionID);
        assertTrue(firstSession.didPitcherReveal);
        assertTrue(firstSession.didBatterReveal);
        assertEq(uint256(firstSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 2);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));
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
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 2);
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
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 2);
        assertEq(atBat.strikes, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(fourthSessionID);

        Session memory fourthSession = game.getSession(fourthSessionID);
        assertTrue(fourthSession.didPitcherReveal);
        assertTrue(fourthSession.didBatterReveal);
        assertEq(uint256(fourthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 0);
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
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 2);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(fourthSessionID);

        Session memory fourthSession = game.getSession(fourthSessionID);
        assertTrue(fourthSession.didPitcherReveal);
        assertTrue(fourthSession.didBatterReveal);
        assertEq(uint256(fourthSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 5);
        uint256 fifthSessionID = game.AtBatSessions(AtBatID, 4);
        assertEq(game.SessionAtBat(fifthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 2);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(fifthSessionID);

        Session memory fifthSession = game.getSession(fifthSessionID);
        assertTrue(fifthSession.didPitcherReveal);
        assertTrue(fifthSession.didBatterReveal);
        assertEq(uint256(fifthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);
        uint256 sixthSessionID = game.AtBatSessions(AtBatID, 5);
        assertEq(game.SessionAtBat(sixthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(sixthSessionID);

        Session memory sixthSession = game.getSession(sixthSessionID);
        assertTrue(sixthSession.didPitcherReveal);
        assertTrue(sixthSession.didBatterReveal);
        assertEq(uint256(sixthSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 2);
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
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 2);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(fourthSessionID);

        Session memory fourthSession = game.getSession(fourthSessionID);
        assertTrue(fourthSession.didPitcherReveal);
        assertTrue(fourthSession.didBatterReveal);
        assertEq(uint256(fourthSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 5);
        uint256 fifthSessionID = game.AtBatSessions(AtBatID, 4);
        assertEq(game.SessionAtBat(fifthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 2);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(fifthSessionID);

        Session memory fifthSession = game.getSession(fifthSessionID);
        assertTrue(fifthSession.didPitcherReveal);
        assertTrue(fifthSession.didBatterReveal);
        assertEq(uint256(fifthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);
        uint256 sixthSessionID = game.AtBatSessions(AtBatID, 5);
        assertEq(game.SessionAtBat(sixthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(sixthSessionID);

        Session memory sixthSession = game.getSession(sixthSessionID);
        assertTrue(sixthSession.didPitcherReveal);
        assertTrue(sixthSession.didBatterReveal);
        assertEq(uint256(sixthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 2);
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
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 0);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 2);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _strikeSession(fourthSessionID);

        Session memory fourthSession = game.getSession(fourthSessionID);
        assertTrue(fourthSession.didPitcherReveal);
        assertTrue(fourthSession.didBatterReveal);
        assertEq(uint256(fourthSession.outcome), uint256(Outcome.Strike));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 5);
        uint256 fifthSessionID = game.AtBatSessions(AtBatID, 4);
        assertEq(game.SessionAtBat(fifthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 2);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _ballSession(fifthSessionID);

        Session memory fifthSession = game.getSession(fifthSessionID);
        assertTrue(fifthSession.didPitcherReveal);
        assertTrue(fifthSession.didBatterReveal);
        assertEq(uint256(fifthSession.outcome), uint256(Outcome.Ball));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);
        uint256 sixthSessionID = game.AtBatSessions(AtBatID, 5);
        assertEq(game.SessionAtBat(sixthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        (Pitch memory doublePitch, Swing memory doubleSwing) = _generateDouble();

        _commitPitch(sixthSessionID, player1, player1PrivateKey, doublePitch);
        _commitSwing(sixthSessionID, player2, player2PrivateKey, doubleSwing);

        _revealPitch(sixthSessionID, player1, doublePitch);
        _revealSwing(sixthSessionID, player2, doubleSwing);

        Session memory sixthSession = game.getSession(sixthSessionID);
        assertTrue(sixthSession.didPitcherReveal);
        assertTrue(sixthSession.didBatterReveal);
        assertEq(uint256(sixthSession.outcome), uint256(Outcome.Double));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 6);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 2);
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
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _foulSession(secondSessionID);

        Session memory secondSession = game.getSession(secondSessionID);
        assertTrue(secondSession.didPitcherReveal);
        assertTrue(secondSession.didBatterReveal);
        assertEq(uint256(secondSession.outcome), uint256(Outcome.Foul));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 3);
        uint256 thirdSessionID = game.AtBatSessions(AtBatID, 2);
        assertEq(game.SessionAtBat(thirdSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        _foulSession(thirdSessionID);

        Session memory thirdSession = game.getSession(thirdSessionID);
        assertTrue(thirdSession.didPitcherReveal);
        assertTrue(thirdSession.didBatterReveal);
        assertEq(uint256(thirdSession.outcome), uint256(Outcome.Foul));

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 4);
        uint256 fourthSessionID = game.AtBatSessions(AtBatID, 3);
        assertEq(game.SessionAtBat(fourthSessionID), AtBatID);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));
    }

    function test_at_bat_progress_events() public {
        AtBat memory atBat = game.getAtBat(AtBatID);
        assertEq(atBat.pitcherNFT.nftAddress, address(characterNFTs));
        assertEq(atBat.pitcherNFT.tokenID, PitcherTokenID);
        assertEq(atBat.batterNFT.nftAddress, address(otherCharacterNFTs));
        assertEq(atBat.batterNFT.tokenID, BatterTokenID);

        assertEq(game.getNumberOfSessionsInAtBat(AtBatID), 1);
        uint256 nextSessionID = game.AtBatSessions(AtBatID, 0);
        assertEq(game.SessionAtBat(nextSessionID), AtBatID);

        Pitch memory strikePitch = Pitch(1, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.InsideStrike);
        Pitch memory ballPitch = Pitch(1, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.InsideBall);
        Swing memory takeSwing = Swing(1, SwingType.Take, VerticalLocation.Middle, HorizontalLocation.Middle);

        _commitPitch(nextSessionID, player1, player1PrivateKey, strikePitch);
        _commitSwing(nextSessionID, player2, player2PrivateKey, takeSwing);

        _revealPitch(nextSessionID, player1, strikePitch);

        vm.prank(player2);
        vm.expectEmit(address(game));
        emit AtBatProgress(
            AtBatID,
            AtBatOutcome.InProgress,
            0,
            1,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        game.revealSwing(nextSessionID, takeSwing.nonce, takeSwing.kind, takeSwing.vertical, takeSwing.horizontal);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 1);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        nextSessionID = game.AtBatSessions(AtBatID, 1);

        _commitPitch(nextSessionID, player1, player1PrivateKey, strikePitch);
        _commitSwing(nextSessionID, player2, player2PrivateKey, takeSwing);

        _revealPitch(nextSessionID, player1, strikePitch);

        vm.prank(player2);
        vm.expectEmit(address(game));
        emit AtBatProgress(
            AtBatID,
            AtBatOutcome.InProgress,
            0,
            2,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        game.revealSwing(nextSessionID, takeSwing.nonce, takeSwing.kind, takeSwing.vertical, takeSwing.horizontal);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        nextSessionID = game.AtBatSessions(AtBatID, 2);

        _commitPitch(nextSessionID, player1, player1PrivateKey, ballPitch);
        _commitSwing(nextSessionID, player2, player2PrivateKey, takeSwing);

        _revealPitch(nextSessionID, player1, ballPitch);

        vm.prank(player2);
        vm.expectEmit(address(game));
        emit AtBatProgress(
            AtBatID,
            AtBatOutcome.InProgress,
            1,
            2,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        game.revealSwing(nextSessionID, takeSwing.nonce, takeSwing.kind, takeSwing.vertical, takeSwing.horizontal);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        nextSessionID = game.AtBatSessions(AtBatID, 3);

        _commitPitch(nextSessionID, player1, player1PrivateKey, ballPitch);
        _commitSwing(nextSessionID, player2, player2PrivateKey, takeSwing);

        _revealPitch(nextSessionID, player1, ballPitch);

        vm.prank(player2);
        vm.expectEmit(address(game));
        emit AtBatProgress(
            AtBatID,
            AtBatOutcome.InProgress,
            2,
            2,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        game.revealSwing(nextSessionID, takeSwing.nonce, takeSwing.kind, takeSwing.vertical, takeSwing.horizontal);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 2);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        nextSessionID = game.AtBatSessions(AtBatID, 4);

        _commitPitch(nextSessionID, player1, player1PrivateKey, ballPitch);
        _commitSwing(nextSessionID, player2, player2PrivateKey, takeSwing);

        _revealPitch(nextSessionID, player1, ballPitch);

        vm.prank(player2);
        vm.expectEmit(address(game));
        emit AtBatProgress(
            AtBatID,
            AtBatOutcome.InProgress,
            3,
            2,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        game.revealSwing(nextSessionID, takeSwing.nonce, takeSwing.kind, takeSwing.vertical, takeSwing.horizontal);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.InProgress));

        nextSessionID = game.AtBatSessions(AtBatID, 5);

        (Pitch memory hrPitch, Swing memory hrSwing) = _generateHomeRun();

        _commitPitch(nextSessionID, player1, player1PrivateKey, hrPitch);

        _commitSwing(nextSessionID, player2, player2PrivateKey, hrSwing);

        _revealPitch(nextSessionID, player1, hrPitch);

        vm.prank(player2);
        emit AtBatProgress(
            AtBatID,
            AtBatOutcome.HomeRun,
            3,
            2,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        game.revealSwing(nextSessionID, hrSwing.nonce, hrSwing.kind, hrSwing.vertical, hrSwing.horizontal);

        atBat = game.getAtBat(AtBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 2);
        assertEq(uint256(atBat.outcome), uint256(AtBatOutcome.HomeRun));
    }
}

contract FullcountTest_atBatInviteOnly is FullcountAtBatTest {
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

        vm.expectEmit(address(game));
        emit AtBatStarted(
            initialNumAtBats + 1, address(characterNFTs), tokenID, initialNumSessions + 1, PlayerType.Batter, true
        );
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

        vm.expectEmit(address(game));
        emit AtBatStarted(
            initialNumAtBats + 1, address(characterNFTs), tokenID, initialNumSessions + 1, PlayerType.Pitcher, true
        );
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
