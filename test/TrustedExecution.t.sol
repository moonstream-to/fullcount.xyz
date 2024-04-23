// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console2 } from "../lib/forge-std/src/Test.sol";
import { FullcountAtBatTest } from "./AtBats.t.sol";
import {
    AtBat,
    AtBatOutcome,
    HorizontalLocation,
    NFT,
    Outcome,
    Pitch,
    PitchSpeed,
    Session,
    Swing,
    SwingType,
    VerticalLocation
} from "../src/data.sol";

contract TrustedExecutionTest is FullcountAtBatTest {
    uint256 executor1PrivateKey = 0x101;
    address executor1 = vm.addr(executor1PrivateKey);

    event ExecutorChange(address indexed player, address indexed executor, bool approved);

    function _setExecutorForPlayer(address executor, address player, bool approved) internal {
        vm.prank(player);
        game.setTrustedExecutor(executor, approved);
    }
}

contract TrustedExecutionTest_executors is TrustedExecutionTest {
    function test_set_executor() public {
        assertFalse(game.isExecutorForPlayer(executor1, player1));
        assertFalse(game.isExecutorForPlayer(randomPerson, player1));

        vm.expectEmit(address(game));
        emit ExecutorChange(player1, executor1, true);
        _setExecutorForPlayer(executor1, player1, true);

        assertTrue(game.isExecutorForPlayer(executor1, player1));
        assertFalse(game.isExecutorForPlayer(randomPerson, player1));
    }
}

contract TrustedExecutionTest_submitAtBat is TrustedExecutionTest {
    uint256 PitcherTokenID;
    uint256 BatterTokenID;

    function setUp() public virtual override {
        super.setUp();

        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        PitcherTokenID = tokenID;
        BatterTokenID = otherTokenID;
    }

    function test_must_be_executor_for_both_players_to_submit_at_bat() public {
        NFT memory pitcher = NFT({ nftAddress: address(characterNFTs), tokenID: PitcherTokenID });

        NFT memory batter = NFT({ nftAddress: address(otherCharacterNFTs), tokenID: BatterTokenID });

        Pitch[] memory pitches = new Pitch[](1);
        pitches[0] = Pitch({
            nonce: 0,
            speed: PitchSpeed.Fast,
            vertical: VerticalLocation.Middle,
            horizontal: HorizontalLocation.Middle
        });

        Swing[] memory swings = new Swing[](1);
        swings[0] = Swing({
            nonce: 0,
            kind: SwingType.Contact,
            vertical: VerticalLocation.Middle,
            horizontal: HorizontalLocation.Middle
        });

        vm.prank(executor1);
        vm.expectRevert("Fullcount.submitAtBat: sender is not an executor for pitcher.");
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.HomeRun);

        vm.prank(player1);
        game.setTrustedExecutor(executor1, true);

        vm.prank(executor1);
        vm.expectRevert("Fullcount.submitAtBat: sender is not an executor for batter.");
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.HomeRun);

        vm.prank(player2);
        game.setTrustedExecutor(executor1, true);

        vm.prank(executor1);
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.HomeRun);
    }

    function test_submit_at_bat_populates_at_bat_and_sessions() public {
        vm.prank(player1);
        game.setTrustedExecutor(executor1, true);

        vm.prank(player2);
        game.setTrustedExecutor(executor1, true);

        uint256 initialNumAtBats = game.NumAtBats();
        uint256 initialNumSessions = game.NumSessions();

        NFT memory pitcher = NFT({ nftAddress: address(characterNFTs), tokenID: PitcherTokenID });
        NFT memory batter = NFT({ nftAddress: address(otherCharacterNFTs), tokenID: BatterTokenID });
        Pitch[] memory pitches = new Pitch[](1);
        Swing[] memory swings = new Swing[](1);

        (pitches[0], swings[0]) = _generateHomeRun();

        vm.prank(executor1);
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.HomeRun);

        uint256 atBatID = game.NumAtBats();

        assertEq(atBatID, initialNumAtBats + 1);
        assertEq(game.NumSessions(), initialNumSessions + 1);

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.pitcherNFT.nftAddress, pitcher.nftAddress);
        assertEq(atBat.pitcherNFT.tokenID, pitcher.tokenID);
        assertEq(atBat.batterNFT.nftAddress, batter.nftAddress);
        assertEq(atBat.batterNFT.tokenID, batter.tokenID);
        assertTrue(atBat.outcome == AtBatOutcome.HomeRun);

        Session memory session = game.getSession(game.AtBatSessions(atBatID, 0));
        assertEq(session.pitcherNFT.nftAddress, pitcher.nftAddress);
        assertEq(session.pitcherNFT.tokenID, pitcher.tokenID);
        assertEq(session.batterNFT.nftAddress, batter.nftAddress);
        assertEq(session.batterNFT.tokenID, batter.tokenID);
        assertTrue(session.outcome == Outcome.HomeRun);
    }

    function test_submit_three_pitch_strikeout() public {
        vm.prank(player1);
        game.setTrustedExecutor(executor1, true);

        vm.prank(player2);
        game.setTrustedExecutor(executor1, true);

        uint256 initialNumAtBats = game.NumAtBats();
        uint256 initialNumSessions = game.NumSessions();

        uint256 atBatLength = 3;

        NFT memory pitcher = NFT({ nftAddress: address(characterNFTs), tokenID: PitcherTokenID });
        NFT memory batter = NFT({ nftAddress: address(otherCharacterNFTs), tokenID: BatterTokenID });
        Pitch[] memory pitches = new Pitch[](atBatLength);
        Swing[] memory swings = new Swing[](atBatLength);

        (pitches[0], swings[0]) = _generateStrike();
        (pitches[1], swings[1]) = _generateStrike();
        (pitches[2], swings[2]) = _generateStrike();

        vm.prank(executor1);
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.Strikeout);

        uint256 atBatID = game.NumAtBats();

        assertEq(atBatID, initialNumAtBats + 1);
        assertEq(game.NumSessions(), initialNumSessions + atBatLength);

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 2);
        assertTrue(atBat.outcome == AtBatOutcome.Strikeout);

        Session memory session;
        for (uint256 i = 0; i < atBatLength; i++) {
            session = game.getSession(game.AtBatSessions(atBatID, i));
            assertTrue(session.outcome == Outcome.Strike);
        }
    }

    function test_submit_four_ball_walk() public {
        vm.prank(player1);
        game.setTrustedExecutor(executor1, true);

        vm.prank(player2);
        game.setTrustedExecutor(executor1, true);

        uint256 initialNumAtBats = game.NumAtBats();
        uint256 initialNumSessions = game.NumSessions();

        uint256 atBatLength = 4;

        NFT memory pitcher = NFT({ nftAddress: address(characterNFTs), tokenID: PitcherTokenID });
        NFT memory batter = NFT({ nftAddress: address(otherCharacterNFTs), tokenID: BatterTokenID });
        Pitch[] memory pitches = new Pitch[](atBatLength);
        Swing[] memory swings = new Swing[](atBatLength);

        (pitches[0], swings[0]) = _generateBall();
        (pitches[1], swings[1]) = _generateBall();
        (pitches[2], swings[2]) = _generateBall();
        (pitches[3], swings[3]) = _generateBall();

        vm.prank(executor1);
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.Walk);

        uint256 atBatID = game.NumAtBats();

        assertEq(atBatID, initialNumAtBats + 1);
        assertEq(game.NumSessions(), initialNumSessions + atBatLength);

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.balls, 3);
        assertEq(atBat.strikes, 0);
        assertTrue(atBat.outcome == AtBatOutcome.Walk);

        Session memory session;
        for (uint256 i = 0; i < atBatLength; i++) {
            session = game.getSession(game.AtBatSessions(atBatID, i));
            assertTrue(session.outcome == Outcome.Ball);
        }
    }

    function test_submit_strike_strike_foul_double() public {
        vm.prank(player1);
        game.setTrustedExecutor(executor1, true);

        vm.prank(player2);
        game.setTrustedExecutor(executor1, true);

        uint256 initialNumAtBats = game.NumAtBats();
        uint256 initialNumSessions = game.NumSessions();

        uint256 atBatLength = 4;

        NFT memory pitcher = NFT({ nftAddress: address(characterNFTs), tokenID: PitcherTokenID });
        NFT memory batter = NFT({ nftAddress: address(otherCharacterNFTs), tokenID: BatterTokenID });
        Pitch[] memory pitches = new Pitch[](atBatLength);
        Swing[] memory swings = new Swing[](atBatLength);

        (pitches[0], swings[0]) = _generateStrike();
        (pitches[1], swings[1]) = _generateStrike();
        (pitches[2], swings[2]) = _generateFoul();
        (pitches[3], swings[3]) = _generateDouble();

        vm.prank(executor1);
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.Double);

        uint256 atBatID = game.NumAtBats();

        assertEq(atBatID, initialNumAtBats + 1);
        assertEq(game.NumSessions(), initialNumSessions + atBatLength);

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.balls, 0);
        assertEq(atBat.strikes, 2);
        assertTrue(atBat.outcome == AtBatOutcome.Double);

        Session memory session;
        for (uint256 i = 0; i < atBatLength; i++) {
            session = game.getSession(game.AtBatSessions(atBatID, i));
            if (i == 0 || i == 1) {
                assertTrue(session.outcome == Outcome.Strike);
            } else if (i == 2) {
                assertTrue(session.outcome == Outcome.Foul);
            } else {
                assertTrue(session.outcome == Outcome.Double);
            }
        }
    }

    function test_submit_ball_then_home_run_events() public {
        vm.prank(player1);
        game.setTrustedExecutor(executor1, true);

        vm.prank(player2);
        game.setTrustedExecutor(executor1, true);

        uint256 initialNumAtBats = game.NumAtBats();
        uint256 initialNumSessions = game.NumSessions();

        uint256 atBatLength = 2;

        NFT memory pitcher = NFT({ nftAddress: address(characterNFTs), tokenID: PitcherTokenID });
        NFT memory batter = NFT({ nftAddress: address(otherCharacterNFTs), tokenID: BatterTokenID });
        Pitch[] memory pitches = new Pitch[](atBatLength);
        Swing[] memory swings = new Swing[](atBatLength);

        (pitches[0], swings[0]) = _generateBall();
        (pitches[1], swings[1]) = _generateHomeRun();

        vm.prank(executor1);
        vm.expectEmit(address(game));
        emit PitchCommitted(initialNumSessions + 1);
        vm.expectEmit(address(game));
        emit SwingCommitted(initialNumSessions + 1);
        vm.expectEmit(address(game));
        emit PitchRevealed(initialNumSessions + 1, pitches[0]);
        vm.expectEmit(address(game));
        emit SwingRevealed(initialNumSessions + 1, swings[0]);
        vm.expectEmit(address(game));
        emit SessionResolved(
            initialNumSessions + 1,
            Outcome.Ball,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        vm.expectEmit(address(game));
        emit AtBatProgress(
            initialNumAtBats + 1,
            AtBatOutcome.InProgress,
            1,
            0,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        vm.expectEmit(address(game));
        emit PitchCommitted(initialNumSessions + 2);
        vm.expectEmit(address(game));
        emit SwingCommitted(initialNumSessions + 2);
        vm.expectEmit(address(game));
        emit PitchRevealed(initialNumSessions + 2, pitches[1]);
        vm.expectEmit(address(game));
        emit SwingRevealed(initialNumSessions + 2, swings[1]);
        vm.expectEmit(address(game));
        emit SessionResolved(
            initialNumSessions + 2,
            Outcome.HomeRun,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        vm.expectEmit(address(game));
        emit AtBatProgress(
            initialNumAtBats + 1,
            AtBatOutcome.HomeRun,
            1,
            0,
            address(characterNFTs),
            PitcherTokenID,
            address(otherCharacterNFTs),
            BatterTokenID
        );
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.HomeRun);

        uint256 atBatID = game.NumAtBats();

        assertEq(atBatID, initialNumAtBats + 1);
        assertEq(game.NumSessions(), initialNumSessions + atBatLength);

        AtBat memory atBat = game.getAtBat(atBatID);
        assertEq(atBat.balls, 1);
        assertEq(atBat.strikes, 0);
        assertTrue(atBat.outcome == AtBatOutcome.HomeRun);

        Session memory session;
        for (uint256 i = 0; i < atBatLength; i++) {
            session = game.getSession(game.AtBatSessions(atBatID, i));
            if (i == 0) {
                assertTrue(session.outcome == Outcome.Ball);
            } else {
                assertTrue(session.outcome == Outcome.HomeRun);
            }
        }
    }

    function test_submit_with_inconclusive_at_bat() public {
        vm.prank(player1);
        game.setTrustedExecutor(executor1, true);

        vm.prank(player2);
        game.setTrustedExecutor(executor1, true);

        uint256 initialNumAtBats = game.NumAtBats();
        uint256 initialNumSessions = game.NumSessions();

        uint256 atBatLength = 6;

        NFT memory pitcher = NFT({ nftAddress: address(characterNFTs), tokenID: PitcherTokenID });
        NFT memory batter = NFT({ nftAddress: address(otherCharacterNFTs), tokenID: BatterTokenID });
        Pitch[] memory pitches = new Pitch[](atBatLength);
        Swing[] memory swings = new Swing[](atBatLength);

        (pitches[0], swings[0]) = _generateStrike();
        (pitches[1], swings[1]) = _generateBall();
        (pitches[2], swings[2]) = _generateStrike();
        (pitches[3], swings[3]) = _generateBall();
        (pitches[4], swings[4]) = _generateFoul();
        (pitches[5], swings[5]) = _generateBall();

        vm.prank(executor1);
        vm.expectRevert("Fullcount.submitAtBat: invalid at-bat - inconclusive");
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.InProgress);

        assertEq(game.NumAtBats(), initialNumAtBats);
        assertEq(game.NumSessions(), initialNumSessions);
    }

    function test_submit_with_multiple_finalities() public {
        vm.prank(player1);
        game.setTrustedExecutor(executor1, true);

        vm.prank(player2);
        game.setTrustedExecutor(executor1, true);

        uint256 initialNumAtBats = game.NumAtBats();
        uint256 initialNumSessions = game.NumSessions();

        uint256 atBatLength = 4;

        NFT memory pitcher = NFT({ nftAddress: address(characterNFTs), tokenID: PitcherTokenID });
        NFT memory batter = NFT({ nftAddress: address(otherCharacterNFTs), tokenID: BatterTokenID });
        Pitch[] memory pitches = new Pitch[](atBatLength);
        Swing[] memory swings = new Swing[](atBatLength);

        (pitches[0], swings[0]) = _generateFoul();
        (pitches[1], swings[1]) = _generateStrike();
        (pitches[2], swings[2]) = _generateStrike();
        (pitches[3], swings[3]) = _generateDouble();

        vm.prank(executor1);
        vm.expectRevert("Fullcount.submitAtBat: invalid at-bat - invalid at-bat");
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.Double);

        assertEq(game.NumAtBats(), initialNumAtBats);
        assertEq(game.NumSessions(), initialNumSessions);
    }

    function test_at_bat_outcome_must_match_executor_proposed_outcome() public {
        vm.prank(player1);
        game.setTrustedExecutor(executor1, true);

        vm.prank(player2);
        game.setTrustedExecutor(executor1, true);

        uint256 initialNumAtBats = game.NumAtBats();
        uint256 initialNumSessions = game.NumSessions();

        uint256 atBatLength = 7;

        NFT memory pitcher = NFT({ nftAddress: address(characterNFTs), tokenID: PitcherTokenID });
        NFT memory batter = NFT({ nftAddress: address(otherCharacterNFTs), tokenID: BatterTokenID });
        Pitch[] memory pitches = new Pitch[](atBatLength);
        Swing[] memory swings = new Swing[](atBatLength);

        (pitches[0], swings[0]) = _generateFoul();
        (pitches[1], swings[1]) = _generateFoul();
        (pitches[2], swings[2]) = _generateFoul();
        (pitches[3], swings[3]) = _generateBall();
        (pitches[4], swings[4]) = _generateBall();
        (pitches[5], swings[5]) = _generateBall();
        (pitches[6], swings[6]) = _generateBall();

        vm.prank(executor1);
        vm.expectRevert("Fullcount.submitAtBat: at-bat outcome does not match executor proposed outcome");
        game.submitAtBat(pitcher, batter, pitches, swings, AtBatOutcome.Strikeout);

        assertEq(game.NumAtBats(), initialNumAtBats);
        assertEq(game.NumSessions(), initialNumSessions);
    }
}
