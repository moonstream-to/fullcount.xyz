// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console, console2 } from "../lib/forge-std/src/Test.sol";
import { Fullcount } from "../src/Fullcount.sol";
import {
    PlayerType,
    Session,
    Pitch,
    Swing,
    PitchSpeed,
    SwingType,
    VerticalLocation,
    HorizontalLocation,
    Outcome
} from "../src/data.sol";
import { ERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { ERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import { IERC20Errors, IERC721Errors } from "../lib/openzeppelin-contracts/contracts/interfaces/draft-IERC6093.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("test", "test") { }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }
}

contract MockERC721 is ERC721 {
    constructor() ERC721("test", "test") { }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }
}

contract FullcountTestBase is Test {
    MockERC721 public characterNFTs;
    MockERC721 public otherCharacterNFTs;
    Fullcount public game;

    uint256 secondsPerPhase = 300;

    uint256 charactersMinted = 0;
    uint256 otherCharactersMinted = 0;

    uint256 player1PrivateKey = 0x1;
    uint256 player2PrivateKey = 0x2;
    uint256 randomPersonPrivateKey = 0x77;
    uint256 poorPlayerPrivateKey = 0x88;

    address player1 = vm.addr(player1PrivateKey);
    address player2 = vm.addr(player2PrivateKey);
    address randomPerson = vm.addr(randomPersonPrivateKey);
    address poorPlayer = vm.addr(poorPlayerPrivateKey);

    function signMessageHash(uint256 privateKey, bytes32 messageHash) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, messageHash);
        return abi.encodePacked(r, s, v);
    }

    event FullcountDeployed(string indexed version, uint256 SecondsPerPhase);
    event SessionStarted(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionJoined(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionAborted(uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID);
    event PitchCommitted(uint256 indexed sessionID);
    event SwingCommitted(uint256 indexed sessionID);
    event PitchRevealed(uint256 indexed sessionID, Pitch pitch);
    event SwingRevealed(uint256 indexed sessionID, Swing swing);
    event SessionResolved(
        uint256 indexed sessionID,
        Outcome indexed outcome,
        address pitcherAddress,
        uint256 pitcherTokenID,
        address batterAddress,
        uint256 batterTokenID
    );

    function setUp() public virtual {
        characterNFTs = new MockERC721();
        otherCharacterNFTs = new MockERC721();
        game = new Fullcount(secondsPerPhase);
    }

    function _startSession(
        address player,
        address nftAddress,
        uint256 tokenID,
        PlayerType playerType
    )
        internal
        returns (uint256)
    {
        vm.startPrank(player);

        uint256 sessionID = game.startSession(nftAddress, tokenID, playerType);

        vm.stopPrank();

        return sessionID;
    }

    function _joinSession(uint256 sessionID, address player, address nftAddress, uint256 tokenID) internal {
        vm.startPrank(player);

        game.joinSession(sessionID, nftAddress, tokenID);

        vm.stopPrank();
    }

    function _commitPitch(uint256 sessionID, address player, uint256 playerPrivateKey, Pitch memory pitch) internal {
        vm.startPrank(player);

        bytes32 pitchMessageHash = game.pitchHash(pitch.nonce, pitch.speed, pitch.vertical, pitch.horizontal);
        bytes memory pitcherCommitment = signMessageHash(playerPrivateKey, pitchMessageHash);

        vm.expectEmit(address(game));
        emit PitchCommitted(sessionID);
        game.commitPitch(sessionID, pitcherCommitment);

        vm.stopPrank();

        Session memory session = game.getSession(sessionID);

        assertTrue(session.didPitcherCommit);

        assertEq(session.pitcherCommit, pitcherCommitment);
    }

    function _commitSwing(uint256 sessionID, address player, uint256 playerPrivateKey, Swing memory swing) internal {
        vm.startPrank(player);

        bytes32 swingMessageHash = game.swingHash(swing.nonce, swing.kind, swing.vertical, swing.horizontal);
        bytes memory batterCommitment = signMessageHash(playerPrivateKey, swingMessageHash);

        vm.expectEmit(address(game));
        emit SwingCommitted(sessionID);
        game.commitSwing(sessionID, batterCommitment);

        vm.stopPrank();

        Session memory session = game.getSession(sessionID);
        assertTrue(session.didBatterCommit);
        assertEq(session.batterCommit, batterCommitment);
    }

    function _revealPitch(uint256 sessionID, address player, Pitch memory pitch) internal {
        vm.startPrank(player);

        vm.expectEmit(address(game));
        emit PitchRevealed(sessionID, pitch);
        game.revealPitch(sessionID, pitch.nonce, pitch.speed, pitch.vertical, pitch.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(sessionID);
        assertTrue(session.didPitcherReveal);

        Pitch memory sessionPitch = session.pitcherReveal;
        assertEq(sessionPitch.nonce, pitch.nonce);
        assertEq(uint256(sessionPitch.speed), uint256(pitch.speed));
        assertEq(uint256(sessionPitch.vertical), uint256(pitch.vertical));
        assertEq(uint256(sessionPitch.horizontal), uint256(pitch.horizontal));
    }

    function _revealSwing(uint256 sessionID, address player, Swing memory swing) internal {
        vm.startPrank(player);

        vm.expectEmit(address(game));
        emit SwingRevealed(sessionID, swing);
        game.revealSwing(sessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(sessionID);
        assertTrue(session.didBatterReveal);

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));
    }
}

contract FullcountTestDeployment is FullcountTestBase {
    function test_Deployment() public {
        vm.expectEmit();
        emit FullcountDeployed("0.0.1", secondsPerPhase);
        Fullcount newGame = new Fullcount(secondsPerPhase);
        assertEq(newGame.FullcountVersion(), "0.0.1");
        assertEq(newGame.SecondsPerPhase(), secondsPerPhase);
        assertEq(newGame.NumSessions(), 0);
    }
}

/**
 * startSession tests:
 * - [x] fails when game is not approved to transfer character:
 * testRevert_if_game_not_approved_to_transfer_character
 * - [x] fails attempts to start session on behalf of player by random account:
 * testRevert_if_transaction_sent_by_random_person
 * - [x] succeeds when starting session as pitcher: test_as_pitcher
 * - [x] succeeds when starting session as batter: test_as_batter
 */
contract FullcountTest_startSession is FullcountTestBase {
    function testRevert_if_game_not_approved_to_transfer_character() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);

        vm.expectRevert(
            abi.encodeWithSelector(IERC721Errors.ERC721InsufficientApproval.selector, address(game), tokenID)
        );

        game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);
        assertEq(game.NumSessions(), initialNumSessions);

        assertEq(characterNFTs.ownerOf(tokenID), player1);

        vm.stopPrank();
    }

    function test_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        vm.expectEmit(address(game));
        emit SessionStarted(initialNumSessions + 1, address(characterNFTs), tokenID, PlayerType.Pitcher);
        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        assertEq(characterNFTs.ownerOf(tokenID), address(game));

        uint256 terminalNumSessions = game.NumSessions();
        assertEq(sessionID, terminalNumSessions);
        assertEq(terminalNumSessions, initialNumSessions + 1);

        Session memory session = game.getSession(sessionID);
        assertEq(session.phaseStartTimestamp, block.timestamp);
        assertEq(session.pitcherAddress, address(characterNFTs));
        assertEq(session.pitcherTokenID, tokenID);
        assertEq(session.batterAddress, address(0));
        assertEq(session.batterTokenID, 0);

        assertEq(game.Staker(address(characterNFTs), tokenID), player1);
        assertEq(game.StakedSession(address(characterNFTs), tokenID), sessionID);

        vm.stopPrank();
    }

    function test_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        vm.expectEmit(address(game));
        emit SessionStarted(initialNumSessions + 1, address(characterNFTs), tokenID, PlayerType.Batter);
        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        assertEq(characterNFTs.ownerOf(tokenID), address(game));

        uint256 terminalNumSessions = game.NumSessions();
        assertEq(sessionID, terminalNumSessions);
        assertEq(terminalNumSessions, initialNumSessions + 1);

        Session memory session = game.getSession(sessionID);
        assertEq(session.phaseStartTimestamp, block.timestamp);
        assertEq(session.batterAddress, address(characterNFTs));
        assertEq(session.batterTokenID, tokenID);
        assertEq(session.pitcherAddress, address(0));
        assertEq(session.pitcherTokenID, 0);

        assertEq(game.Staker(address(characterNFTs), tokenID), player1);
        assertEq(game.StakedSession(address(characterNFTs), tokenID), sessionID);

        vm.stopPrank();
    }

    function testRevert_if_transaction_sent_by_random_person() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        vm.stopPrank();

        vm.prank(randomPerson);
        vm.expectRevert("Fullcount.startSession: msg.sender is not NFT owner");
        game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        assertEq(characterNFTs.ownerOf(tokenID), player1);

        assertEq(game.NumSessions(), initialNumSessions);
    }
}

/**
 * joinSession tests:
 * - [x] fails when joining non-existent session: testRevert_when_joining_nonexistent_session
 * - [x] fails when joining session that is already full: testRevert_when_session_is_full
 * - [x] fails when joining session in which opponent left prior to joining: testRevert_when_joining_aborted_session
 * - [x] fails when joining on behalf of NFT owner using random account: testRevert_if_msg_sender_not_nft_owner
 * - [x] fails when joiner has not approved game to transfer character:
 * testRevert_when_joiner_has_not_approved_nft_transfer
 * - [x] succeeds when joining session as pitcher: test_as_pitcher
 * - [x] succeeds when joining session as batter: test_as_batter
 */
contract FullcountTest_joinSession is FullcountTestBase {
    function testRevert_when_joining_nonexistent_session() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);
        characterNFTs.approve(address(game), tokenID);

        vm.startPrank(player2);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.expectRevert("Fullcount.joinSession: session does not exist");
        game.joinSession(initialNumSessions + 1, address(otherCharacterNFTs), otherTokenID);

        assertEq(game.NumSessions(), initialNumSessions);

        assertEq(otherCharacterNFTs.ownerOf(otherTokenID), player2);

        vm.stopPrank();
    }

    function test_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        uint256 initialNumSessions = game.NumSessions();

        uint256 initialBlockTimestamp = block.timestamp;
        uint256 startJoinOffsetSeconds = 5;
        uint256 expectedNextPhaseTimestamp = initialBlockTimestamp + startJoinOffsetSeconds;

        vm.startPrank(player1);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        vm.startPrank(player2);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.warp(initialBlockTimestamp + startJoinOffsetSeconds);
        vm.expectEmit(address(game));
        emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Batter);
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        assertEq(game.NumSessions(), initialNumSessions + 1);

        Session memory session = game.getSession(sessionID);
        assertEq(session.phaseStartTimestamp, expectedNextPhaseTimestamp);
        assertEq(session.pitcherAddress, address(characterNFTs));
        assertEq(session.pitcherTokenID, tokenID);
        assertEq(session.batterAddress, address(otherCharacterNFTs));
        assertEq(session.batterTokenID, otherTokenID);

        assertEq(otherCharacterNFTs.ownerOf(otherTokenID), address(game));
        assertEq(game.StakedSession(address(otherCharacterNFTs), otherTokenID), sessionID);
        assertEq(game.Staker(address(otherCharacterNFTs), otherTokenID), player2);

        vm.stopPrank();
    }

    function test_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        uint256 initialNumSessions = game.NumSessions();

        uint256 initialBlockTimestamp = block.timestamp;
        uint256 startJoinOffsetSeconds = 500;
        uint256 expectedNextPhaseTimestamp = initialBlockTimestamp + startJoinOffsetSeconds;

        vm.startPrank(player1);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.startPrank(player2);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.warp(initialBlockTimestamp + startJoinOffsetSeconds);
        vm.expectEmit(address(game));
        emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Pitcher);
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        assertEq(game.NumSessions(), initialNumSessions + 1);

        Session memory session = game.getSession(sessionID);
        assertEq(session.phaseStartTimestamp, expectedNextPhaseTimestamp);
        assertEq(session.batterAddress, address(characterNFTs));
        assertEq(session.batterTokenID, tokenID);
        assertEq(session.pitcherAddress, address(otherCharacterNFTs));
        assertEq(session.pitcherTokenID, otherTokenID);

        assertEq(otherCharacterNFTs.ownerOf(otherTokenID), address(game));
        assertEq(game.StakedSession(address(otherCharacterNFTs), otherTokenID), sessionID);
        assertEq(game.Staker(address(otherCharacterNFTs), otherTokenID), player2);

        vm.stopPrank();
    }

    function testRevert_when_joiner_has_not_approved_nft_transfer() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        vm.startPrank(player1);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.startPrank(player2);

        vm.expectRevert(
            abi.encodeWithSelector(IERC721Errors.ERC721InsufficientApproval.selector, address(game), otherTokenID)
        );
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();
    }

    function testRevert_when_session_is_full() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        vm.startPrank(player1);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        vm.startPrank(player2);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.expectEmit(address(game));
        emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Batter);
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();

        otherCharactersMinted++;
        uint256 nextOtherTokenID = otherCharactersMinted;
        otherCharacterNFTs.mint(randomPerson, nextOtherTokenID);

        vm.startPrank(randomPerson);

        otherCharacterNFTs.approve(address(game), nextOtherTokenID);

        vm.expectRevert("Fullcount.joinSession: session is already full");
        game.joinSession(sessionID, address(otherCharacterNFTs), nextOtherTokenID);

        vm.stopPrank();
    }

    function testRevert_if_msg_sender_not_nft_owner() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        vm.startPrank(player1);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.startPrank(player2);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.stopPrank();

        vm.prank(randomPerson);
        vm.expectRevert("Fullcount.joinSession: msg.sender is not NFT owner");
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);
    }

    function testRevert_when_joining_aborted_session() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        vm.startPrank(player1);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        game.abortSession(sessionID);

        vm.stopPrank();

        assertEq(game.sessionProgress(sessionID), 1);

        vm.startPrank(player2);

        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.expectRevert("Fullcount.joinSession: opponent left session");
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();
    }
}

/**
 * abortSession tests:
 * - [x] fails when aborting non-existent session: testRevert_when_aborting_nonexistent_session
 * - [x] fails when aborting session that is not in the "join" phase:
 * testRevert_when_aborting_session_in_commitment_phase
 * - [x] fails when aborting session with pitcher that was not staked by the aborter:
 * testRevert_when_pitcher_aborted_by_nonstaker
 * - [x] fails when aborting session with batter that was not staked by the aborter:
 * testRevert_when_batter_aborted_by_nonstaker
 * - [x] succeeds when aborting session as pitcher: test_as_pitcher
 * - [x] succeeds when aborting session as batter: test_as_batter
 */
contract FullcountTest_abortSession is FullcountTestBase {
    function test_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        assertEq(game.sessionProgress(sessionID), 2);

        Session memory initialSession = game.getSession(sessionID);
        assertEq(initialSession.pitcherAddress, address(characterNFTs));
        assertEq(initialSession.pitcherTokenID, tokenID);
        assertEq(initialSession.batterAddress, address(0));
        assertEq(initialSession.batterTokenID, 0);

        vm.expectEmit();
        emit SessionAborted(sessionID, address(characterNFTs), tokenID);
        game.abortSession(sessionID);

        assertEq(game.sessionProgress(sessionID), 1);

        Session memory terminalSession = game.getSession(sessionID);
        assertEq(terminalSession.pitcherAddress, address(0));
        assertEq(terminalSession.pitcherTokenID, 0);
        assertEq(terminalSession.batterAddress, address(0));
        assertEq(terminalSession.batterTokenID, 0);

        vm.stopPrank();
    }

    function test_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        assertEq(characterNFTs.ownerOf(tokenID), address(game));

        assertEq(game.sessionProgress(sessionID), 2);

        Session memory initialSession = game.getSession(sessionID);
        assertEq(initialSession.batterAddress, address(characterNFTs));
        assertEq(initialSession.batterTokenID, tokenID);
        assertEq(initialSession.pitcherAddress, address(0));
        assertEq(initialSession.pitcherTokenID, 0);

        vm.expectEmit();
        emit SessionAborted(sessionID, address(characterNFTs), tokenID);
        game.abortSession(sessionID);

        assertEq(characterNFTs.ownerOf(tokenID), player1);

        assertEq(game.sessionProgress(sessionID), 1);

        Session memory terminalSession = game.getSession(sessionID);
        assertEq(terminalSession.batterAddress, address(0));
        assertEq(terminalSession.batterTokenID, 0);
        assertEq(terminalSession.pitcherAddress, address(0));
        assertEq(terminalSession.pitcherTokenID, 0);

        vm.stopPrank();
    }

    function testRevert_when_pitcher_aborted_by_nonstaker() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        assertEq(game.sessionProgress(sessionID), 2);

        vm.stopPrank();

        Session memory initialSession = game.getSession(sessionID);
        assertEq(initialSession.pitcherAddress, address(characterNFTs));
        assertEq(initialSession.pitcherTokenID, tokenID);
        assertEq(initialSession.batterAddress, address(0));
        assertEq(initialSession.batterTokenID, 0);

        vm.prank(player2);
        vm.expectRevert("Fullcount._unstakeNFT: msg.sender is not NFT owner");
        game.abortSession(sessionID);

        assertEq(game.sessionProgress(sessionID), 2);

        Session memory terminalSession = game.getSession(sessionID);
        assertEq(terminalSession.pitcherAddress, address(characterNFTs));
        assertEq(terminalSession.pitcherTokenID, tokenID);
        assertEq(terminalSession.batterAddress, address(0));
        assertEq(terminalSession.batterTokenID, 0);
    }

    function testRevert_when_batter_aborted_by_nonstaker() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        assertEq(game.sessionProgress(sessionID), 2);

        vm.stopPrank();

        Session memory initialSession = game.getSession(sessionID);
        assertEq(initialSession.batterAddress, address(characterNFTs));
        assertEq(initialSession.batterTokenID, tokenID);
        assertEq(initialSession.pitcherAddress, address(0));
        assertEq(initialSession.pitcherTokenID, 0);

        vm.prank(player2);
        vm.expectRevert("Fullcount._unstakeNFT: msg.sender is not NFT owner");
        game.abortSession(sessionID);

        assertEq(game.sessionProgress(sessionID), 2);

        Session memory terminalSession = game.getSession(sessionID);
        assertEq(terminalSession.batterAddress, address(characterNFTs));
        assertEq(terminalSession.batterTokenID, tokenID);
        assertEq(terminalSession.pitcherAddress, address(0));
        assertEq(terminalSession.pitcherTokenID, 0);
    }

    function testRevert_when_aborting_nonexistent_session() public {
        uint256 nonexistentSessionID = game.NumSessions() + 1;
        assertEq(game.sessionProgress(nonexistentSessionID), 0);

        vm.prank(player1);
        vm.expectRevert("Fullcount.abortSession: cannot abort from session in this state");
        game.abortSession(nonexistentSessionID);
    }

    function testRevert_when_aborting_session_in_commitment_phase() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.stopPrank();

        vm.startPrank(player2);

        otherCharacterNFTs.approve(address(game), otherTokenID);

        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();

        assertEq(game.sessionProgress(sessionID), 3);

        vm.startPrank(player1);

        vm.expectRevert("Fullcount.abortSession: cannot abort from session in this state");
        game.abortSession(sessionID);

        vm.stopPrank();

        assertEq(characterNFTs.ownerOf(tokenID), address(game));
        assertEq(otherCharacterNFTs.ownerOf(otherTokenID), address(game));
    }
}

/**
 * commitPitch and commitSwing tests:
 * - [x] succeed when committing pitch/swing in the "commitment" phase: test_full_commitment
 * - [x] successfully progresses section when both commitments are registered: test_full_commitment
 * - [x] fails if commitment already exists (pitch): testRevert_on_second_commitment_by_pitcher
 * - [x] fails if commitment already exists (swing): testRevert_on_second_commitment_by_batter
 * - [x] fails if session is in the "reveal" phase (pitcher):
 * testRevert_on_commitment_after_end_of_commitment_phase_by_pitcher
 * - [x] fails if session is in the "reveal" phase (batter):
 * testRevert_on_commitment_after_end_of_commitment_phase_by_batter
 * - [x] fails if session is expired in the commitment phase (pitcher):
 * testRevert_commitment_fails_after_session_expired_as_pitcher
 * - [x] fails if session is expired in the commitment phase (batter):
 * testRevert_commitment_fails_after_session_expired_as_batter
 * - [x] fails if session is still in the "join" phase (i.e. it hasn't been joined by second player) (pitcher):
 * testRevert_if_second_player_has_not_joined_when_staked_as_pitcher
 * - [x] fails if session is still in the "join" phase (i.e. it hasn't been joined by second player) (batter):
 * testRevert_if_second_player_has_not_joined_when_staked_as_batter
 * - [x] fails if someone other than staker attempts commitment: testRevert_if_commitments_are_not_submitted_by_players
 */
contract FullcountTest_commitPitch_commitSwing is FullcountTestBase {
    uint256 SessionID;
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

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        vm.stopPrank();

        vm.startPrank(player2);

        otherCharacterNFTs.approve(address(game), otherTokenID);

        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();

        SessionID = sessionID;
        PitcherTokenID = tokenID;
        BatterTokenID = otherTokenID;
    }

    function test_full_commitment() public {
        assertEq(game.sessionProgress(SessionID), 3);

        Session memory session = game.getSession(SessionID);

        assertFalse(session.didPitcherCommit);
        assertFalse(session.didBatterCommit);

        vm.startPrank(player1);

        // Player 1 chooses to pitch a fastball in the upper-inside corner of the strike zone
        uint256 pitcherNonce = 0x1902a;
        PitchSpeed pitcherPitch = PitchSpeed.Fast;
        VerticalLocation pitcherVerticalLocation = VerticalLocation.HighStrike;
        HorizontalLocation pitcherHorizontalLocation = HorizontalLocation.InsideStrike;

        bytes32 pitchMessageHash =
            game.pitchHash(pitcherNonce, pitcherPitch, pitcherVerticalLocation, pitcherHorizontalLocation);
        bytes memory pitcherCommitment = signMessageHash(player1PrivateKey, pitchMessageHash);

        vm.expectEmit(address(game));
        emit PitchCommitted(SessionID);
        game.commitPitch(SessionID, pitcherCommitment);

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 3);

        session = game.getSession(SessionID);

        assertTrue(session.didPitcherCommit);
        assertFalse(session.didBatterCommit);

        assertEq(session.pitcherCommit, pitcherCommitment);

        vm.startPrank(player2);

        // Player 2 chooses to make a power swing in the middle of their strike zone.
        uint256 batterNonce = 0x725ae98;
        SwingType batterSwing = SwingType.Power;
        VerticalLocation batterVerticalLocation = VerticalLocation.Middle;
        HorizontalLocation batterHorizontalLocation = HorizontalLocation.Middle;

        bytes32 swingMessageHash =
            game.swingHash(batterNonce, batterSwing, batterVerticalLocation, batterHorizontalLocation);
        bytes memory batterCommitment = signMessageHash(player2PrivateKey, swingMessageHash);

        // We move time forward 1 second so we can test that the phaseStartTimestamp was updated on
        // the session.
        uint256 commitmentsCompleteTimestamp = block.timestamp + 1;
        vm.warp(commitmentsCompleteTimestamp);
        vm.expectEmit(address(game));
        emit SwingCommitted(SessionID);
        game.commitSwing(SessionID, batterCommitment);

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 4);

        session = game.getSession(SessionID);

        assertEq(session.phaseStartTimestamp, commitmentsCompleteTimestamp);

        assertTrue(session.didPitcherCommit);
        assertTrue(session.didBatterCommit);

        assertEq(session.pitcherCommit, pitcherCommitment);
        assertEq(session.batterCommit, batterCommitment);
    }

    function testRevert_on_second_commitment_by_pitcher() public {
        assertEq(game.sessionProgress(SessionID), 3);

        Session memory session = game.getSession(SessionID);

        assertFalse(session.didPitcherCommit);
        assertFalse(session.didBatterCommit);

        vm.startPrank(player1);

        // Player 1 chooses to pitch a fastball in the upper-inside corner of the strike zone
        uint256 pitcherNonce = 0x1902a;
        PitchSpeed pitcherPitch = PitchSpeed.Fast;
        VerticalLocation pitcherVerticalLocation = VerticalLocation.HighStrike;
        HorizontalLocation pitcherHorizontalLocation = HorizontalLocation.InsideStrike;

        bytes32 pitchMessageHash =
            game.pitchHash(pitcherNonce, pitcherPitch, pitcherVerticalLocation, pitcherHorizontalLocation);
        bytes memory pitcherCommitment = signMessageHash(player1PrivateKey, pitchMessageHash);

        vm.expectEmit(address(game));
        emit PitchCommitted(SessionID);
        game.commitPitch(SessionID, pitcherCommitment);

        assertEq(game.sessionProgress(SessionID), 3);

        session = game.getSession(SessionID);

        assertTrue(session.didPitcherCommit);
        assertFalse(session.didBatterCommit);

        assertEq(session.pitcherCommit, pitcherCommitment);

        // Player 1 then decides to change their mind and pitch an offspeed pitch in the lower-outside corner of the
        // strike zone
        uint256 pitcherNonce2 = 0x84535ad85a;
        PitchSpeed pitcherPitch2 = PitchSpeed.Slow;
        VerticalLocation pitcherVerticalLocation2 = VerticalLocation.LowStrike;
        HorizontalLocation pitcherHorizontalLocation2 = HorizontalLocation.OutsideStrike;

        bytes32 pitchMessageHash2 =
            game.pitchHash(pitcherNonce2, pitcherPitch2, pitcherVerticalLocation2, pitcherHorizontalLocation2);

        bytes memory pitcherCommitment2 = signMessageHash(player1PrivateKey, pitchMessageHash2);

        vm.expectRevert("Fullcount.commitPitch: pitcher already committed");
        game.commitPitch(SessionID, pitcherCommitment2);

        assertEq(game.sessionProgress(SessionID), 3);

        session = game.getSession(SessionID);

        assertTrue(session.didPitcherCommit);
        assertFalse(session.didBatterCommit);

        assertEq(session.pitcherCommit, pitcherCommitment);

        vm.stopPrank();
    }

    function testRevert_on_second_commitment_by_batter() public {
        assertEq(game.sessionProgress(SessionID), 3);

        Session memory session = game.getSession(SessionID);

        assertFalse(session.didPitcherCommit);
        assertFalse(session.didBatterCommit);

        vm.startPrank(player2);

        // Player 2 chooses to make a power swing in the middle of their strike zone.
        uint256 batterNonce = 0x725ae98;
        SwingType batterSwing = SwingType.Power;
        VerticalLocation batterVerticalLocation = VerticalLocation.Middle;
        HorizontalLocation batterHorizontalLocation = HorizontalLocation.Middle;

        bytes32 swingMessageHash =
            game.swingHash(batterNonce, batterSwing, batterVerticalLocation, batterHorizontalLocation);
        bytes memory batterCommitment = signMessageHash(player2PrivateKey, swingMessageHash);

        vm.expectEmit(address(game));
        emit SwingCommitted(SessionID);
        game.commitSwing(SessionID, batterCommitment);

        assertEq(game.sessionProgress(SessionID), 3);

        session = game.getSession(SessionID);

        assertFalse(session.didPitcherCommit);
        assertTrue(session.didBatterCommit);

        assertEq(session.batterCommit, batterCommitment);

        // Player 2 changes their mind and decides to make a contact swing at the upper inside corner
        // of the strike zone instead.
        uint256 batterNonce2 = 0x84753aa;
        SwingType batterSwing2 = SwingType.Contact;
        VerticalLocation batterVerticalLocation2 = VerticalLocation.HighStrike;
        HorizontalLocation batterHorizontalLocation2 = HorizontalLocation.InsideStrike;

        bytes32 swingMessageHash2 =
            game.swingHash(batterNonce2, batterSwing2, batterVerticalLocation2, batterHorizontalLocation2);
        bytes memory batterCommitment2 = signMessageHash(player2PrivateKey, swingMessageHash2);

        vm.expectRevert("Fullcount.commitSwing: batter already committed");
        game.commitSwing(SessionID, batterCommitment2);

        assertEq(game.sessionProgress(SessionID), 3);

        session = game.getSession(SessionID);

        assertFalse(session.didPitcherCommit);
        assertTrue(session.didBatterCommit);

        assertEq(session.batterCommit, batterCommitment);

        vm.stopPrank();
    }

    function testRevert_on_commitment_after_end_of_commitment_phase_by_pitcher() public {
        vm.startPrank(player1);

        // Player 1 chooses to pitch a fastball in the upper-inside corner of the strike zone
        uint256 pitcherNonce = 0x1902a;
        PitchSpeed pitcherPitch = PitchSpeed.Fast;
        VerticalLocation pitcherVerticalLocation = VerticalLocation.HighStrike;
        HorizontalLocation pitcherHorizontalLocation = HorizontalLocation.InsideStrike;

        bytes32 pitchMessageHash =
            game.pitchHash(pitcherNonce, pitcherPitch, pitcherVerticalLocation, pitcherHorizontalLocation);
        bytes memory pitcherCommitment = signMessageHash(player1PrivateKey, pitchMessageHash);

        game.commitPitch(SessionID, pitcherCommitment);

        vm.stopPrank();

        vm.startPrank(player2);

        // Player 2 chooses to make a power swing in the middle of their strike zone.
        uint256 batterNonce = 0x725ae98;
        SwingType batterSwing = SwingType.Power;
        VerticalLocation batterVerticalLocation = VerticalLocation.Middle;
        HorizontalLocation batterHorizontalLocation = HorizontalLocation.Middle;

        bytes32 swingMessageHash =
            game.swingHash(batterNonce, batterSwing, batterVerticalLocation, batterHorizontalLocation);
        bytes memory batterCommitment = signMessageHash(player2PrivateKey, swingMessageHash);

        game.commitSwing(SessionID, batterCommitment);

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 4);

        vm.startPrank(player1);

        // Player 1 then decides to change their mind and pitch an offspeed pitch in the lower-outside corner of the
        // strike zone
        uint256 pitcherNonce2 = 0x84535ad85a;
        PitchSpeed pitcherPitch2 = PitchSpeed.Slow;
        VerticalLocation pitcherVerticalLocation2 = VerticalLocation.LowStrike;
        HorizontalLocation pitcherHorizontalLocation2 = HorizontalLocation.OutsideStrike;

        bytes32 pitchMessageHash2 =
            game.pitchHash(pitcherNonce2, pitcherPitch2, pitcherVerticalLocation2, pitcherHorizontalLocation2);

        vm.expectRevert("Fullcount.commitPitch: cannot commit in current state");
        game.commitPitch(SessionID, signMessageHash(player1PrivateKey, pitchMessageHash2));

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 4);

        Session memory session = game.getSession(SessionID);

        assertTrue(session.didPitcherCommit);
        assertTrue(session.didBatterCommit);

        assertEq(session.pitcherCommit, pitcherCommitment);
        assertEq(session.batterCommit, batterCommitment);
    }

    function testRevert_on_commitment_after_end_of_commitment_phase_by_batter() public {
        vm.startPrank(player1);

        // Player 1 chooses to pitch a fastball in the upper-inside corner of the strike zone
        uint256 pitcherNonce = 0x1902a;
        PitchSpeed pitcherPitch = PitchSpeed.Fast;
        VerticalLocation pitcherVerticalLocation = VerticalLocation.HighStrike;
        HorizontalLocation pitcherHorizontalLocation = HorizontalLocation.InsideStrike;

        bytes32 pitchMessageHash =
            game.pitchHash(pitcherNonce, pitcherPitch, pitcherVerticalLocation, pitcherHorizontalLocation);
        bytes memory pitcherCommitment = signMessageHash(player1PrivateKey, pitchMessageHash);

        game.commitPitch(SessionID, pitcherCommitment);

        vm.stopPrank();

        vm.startPrank(player2);

        // Player 2 chooses to make a power swing in the middle of their strike zone.
        uint256 batterNonce = 0x725ae98;
        SwingType batterSwing = SwingType.Power;
        VerticalLocation batterVerticalLocation = VerticalLocation.Middle;
        HorizontalLocation batterHorizontalLocation = HorizontalLocation.Middle;

        bytes32 swingMessageHash =
            game.swingHash(batterNonce, batterSwing, batterVerticalLocation, batterHorizontalLocation);
        bytes memory batterCommitment = signMessageHash(player2PrivateKey, swingMessageHash);

        game.commitSwing(SessionID, batterCommitment);

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 4);

        vm.startPrank(player2);

        // Player 2 changes their mind and decides to make a contact swing at the upper inside corner
        // of the strike zone instead.
        uint256 batterNonce2 = 0x84753aa;
        SwingType batterSwing2 = SwingType.Contact;
        VerticalLocation batterVerticalLocation2 = VerticalLocation.HighStrike;
        HorizontalLocation batterHorizontalLocation2 = HorizontalLocation.InsideStrike;

        bytes32 swingMessageHash2 =
            game.swingHash(batterNonce2, batterSwing2, batterVerticalLocation2, batterHorizontalLocation2);

        vm.expectRevert("Fullcount.commitSwing: cannot commit in current state");
        game.commitSwing(SessionID, signMessageHash(player2PrivateKey, swingMessageHash2));

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 4);

        Session memory session = game.getSession(SessionID);

        assertTrue(session.didPitcherCommit);
        assertTrue(session.didBatterCommit);

        assertEq(session.pitcherCommit, pitcherCommitment);
        assertEq(session.batterCommit, batterCommitment);
    }

    function testRevert_commitment_fails_after_session_expired_as_pitcher() public {
        assertEq(game.sessionProgress(SessionID), 3);

        Session memory session = game.getSession(SessionID);

        assertFalse(session.didPitcherCommit);
        assertFalse(session.didBatterCommit);

        vm.startPrank(player1);

        // Player 1 chooses to pitch a fastball in the upper-inside corner of the strike zone
        uint256 pitcherNonce = 0x1902a;
        PitchSpeed pitcherPitch = PitchSpeed.Fast;
        VerticalLocation pitcherVerticalLocation = VerticalLocation.HighStrike;
        HorizontalLocation pitcherHorizontalLocation = HorizontalLocation.InsideStrike;

        bytes32 pitchMessageHash =
            game.pitchHash(pitcherNonce, pitcherPitch, pitcherVerticalLocation, pitcherHorizontalLocation);
        bytes memory pitcherCommitment = signMessageHash(player1PrivateKey, pitchMessageHash);

        vm.warp(session.phaseStartTimestamp + game.SecondsPerPhase() + 1);
        vm.expectRevert("Fullcount.commitPitch: session has expired");
        game.commitPitch(SessionID, pitcherCommitment);

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 6);

        session = game.getSession(SessionID);

        assertFalse(session.didPitcherCommit);

        assertEq(session.pitcherCommit, bytes(""));
    }

    function testRevert_commitment_fails_after_session_expired_as_batter() public {
        assertEq(game.sessionProgress(SessionID), 3);

        Session memory session = game.getSession(SessionID);

        assertFalse(session.didPitcherCommit);
        assertFalse(session.didBatterCommit);

        vm.startPrank(player2);

        // Player 2 chooses to make a power swing in the middle of their strike zone.
        uint256 batterNonce = 0x725ae98;
        SwingType batterSwing = SwingType.Power;
        VerticalLocation batterVerticalLocation = VerticalLocation.Middle;
        HorizontalLocation batterHorizontalLocation = HorizontalLocation.Middle;

        bytes32 swingMessageHash =
            game.swingHash(batterNonce, batterSwing, batterVerticalLocation, batterHorizontalLocation);
        bytes memory batterCommitment = signMessageHash(player2PrivateKey, swingMessageHash);

        vm.warp(session.phaseStartTimestamp + game.SecondsPerPhase() + 1);
        vm.expectRevert("Fullcount.commitSwing: session has expired");
        game.commitSwing(SessionID, batterCommitment);

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 6);

        session = game.getSession(SessionID);

        assertFalse(session.didBatterCommit);

        assertEq(session.batterCommit, bytes(""));
    }

    function testRevert_if_second_player_has_not_joined_when_staked_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        characterNFTs.mint(player1, tokenID);

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        // Player 1 chooses to pitch a fastball in the upper-inside corner of the strike zone
        uint256 pitcherNonce = 0x1902a;
        PitchSpeed pitcherPitch = PitchSpeed.Fast;
        VerticalLocation pitcherVerticalLocation = VerticalLocation.HighStrike;
        HorizontalLocation pitcherHorizontalLocation = HorizontalLocation.InsideStrike;

        bytes32 pitchMessageHash =
            game.pitchHash(pitcherNonce, pitcherPitch, pitcherVerticalLocation, pitcherHorizontalLocation);
        bytes memory pitcherCommitment = signMessageHash(player1PrivateKey, pitchMessageHash);

        vm.expectRevert("Fullcount.commitPitch: cannot commit in current state");
        game.commitPitch(sessionID, pitcherCommitment);

        vm.stopPrank();
    }

    function testRevert_if_second_player_has_not_joined_when_staked_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        characterNFTs.mint(player1, tokenID);

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        // Player 1 chooses to make a power swing in the middle of their strike zone.
        uint256 batterNonce = 0x725ae98;
        SwingType batterSwing = SwingType.Power;
        VerticalLocation batterVerticalLocation = VerticalLocation.Middle;
        HorizontalLocation batterHorizontalLocation = HorizontalLocation.Middle;

        bytes32 swingMessageHash =
            game.swingHash(batterNonce, batterSwing, batterVerticalLocation, batterHorizontalLocation);
        bytes memory batterCommitment = signMessageHash(player1PrivateKey, swingMessageHash);

        vm.expectRevert("Fullcount.commitSwing: cannot commit in current state");
        game.commitSwing(sessionID, batterCommitment);

        vm.stopPrank();
    }

    function testRevert_if_commitments_are_not_submitted_by_players() public {
        assertEq(game.sessionProgress(SessionID), 3);

        vm.startPrank(randomPerson);

        // Player 1 chooses to pitch a fastball in the upper-inside corner of the strike zone
        uint256 pitcherNonce = 0x1902a;
        PitchSpeed pitcherPitch = PitchSpeed.Fast;
        VerticalLocation pitcherVerticalLocation = VerticalLocation.HighStrike;
        HorizontalLocation pitcherHorizontalLocation = HorizontalLocation.InsideStrike;

        bytes32 pitchMessageHash =
            game.pitchHash(pitcherNonce, pitcherPitch, pitcherVerticalLocation, pitcherHorizontalLocation);
        bytes memory pitcherCommitment = signMessageHash(player1PrivateKey, pitchMessageHash);

        vm.expectRevert("Fullcount.commitPitch: msg.sender did not stake pitcher");
        game.commitPitch(SessionID, pitcherCommitment);

        // Player 2 chooses to make a power swing in the middle of their strike zone.
        uint256 batterNonce = 0x725ae98;
        SwingType batterSwing = SwingType.Power;
        VerticalLocation batterVerticalLocation = VerticalLocation.Middle;
        HorizontalLocation batterHorizontalLocation = HorizontalLocation.Middle;

        bytes32 swingMessageHash =
            game.swingHash(batterNonce, batterSwing, batterVerticalLocation, batterHorizontalLocation);
        bytes memory batterCommitment = signMessageHash(player2PrivateKey, swingMessageHash);

        vm.expectRevert("Fullcount.commitSwing: msg.sender did not stake batter");
        game.commitSwing(SessionID, batterCommitment);

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 3);

        Session memory session = game.getSession(SessionID);

        assertFalse(session.didPitcherCommit);
        assertFalse(session.didBatterCommit);

        assertEq(session.pitcherCommit, bytes(""));
        assertEq(session.batterCommit, bytes(""));
    }
}

contract FullcountTest_reveal is FullcountTestBase {
    uint256 SessionID;
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

        vm.startPrank(player1);

        characterNFTs.approve(address(game), tokenID);

        vm.stopPrank();

        uint256 sessionID = _startSession(player1, address(characterNFTs), tokenID, PlayerType.Pitcher);

        vm.startPrank(player2);

        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.stopPrank();

        _joinSession(sessionID, player2, address(otherCharacterNFTs), otherTokenID);

        SessionID = sessionID;
        PitcherTokenID = tokenID;
        BatterTokenID = otherTokenID;

        Session memory session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, address(characterNFTs));
        assertEq(session.batterAddress, address(otherCharacterNFTs));
        assertEq(session.pitcherTokenID, PitcherTokenID);
        assertEq(session.batterTokenID, BatterTokenID);
    }

    function test_pitcher_reveal_then_batter_reveal() public {
        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(287_349_237_429_034_239_084, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a power swing in the middle of their strike zone.
        Swing memory swing = Swing(
            239_480_239_842_390_842_390_482_390, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        _revealPitch(SessionID, player1, pitch);

        _revealSwing(SessionID, player2, swing);

        assertEq(game.sessionProgress(SessionID), 5);

        Session memory session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, address(characterNFTs));
        assertEq(session.batterAddress, address(0));
        assertEq(session.pitcherTokenID, PitcherTokenID);
        assertEq(session.batterTokenID, 0);
    }

    function test_batter_reveal_then_pitcher_reveal() public {
        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a power swing in the middle of their strike zone.
        Swing memory swing = Swing(
            239_480_239_842_390_842_390_482_390, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(287_349_237_429_034_239_084, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 4);

        _revealSwing(SessionID, player2, swing);

        _revealPitch(SessionID, player1, pitch);

        assertEq(game.sessionProgress(SessionID), 5);

        Session memory session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, address(0));
        assertEq(session.batterAddress, address(otherCharacterNFTs));
        assertEq(session.pitcherTokenID, 0);
        assertEq(session.batterTokenID, BatterTokenID);
    }
}

contract FullcountTest_unstake is FullcountTestBase {
    uint256 SessionID;
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

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        vm.stopPrank();

        vm.startPrank(player2);

        otherCharacterNFTs.approve(address(game), otherTokenID);

        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();

        SessionID = sessionID;
        PitcherNFTAddress = address(characterNFTs);
        PitcherTokenID = tokenID;
        BatterNFTAddress = address(otherCharacterNFTs);
        BatterTokenID = otherTokenID;

        Session memory session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, address(characterNFTs));
        assertEq(session.batterAddress, address(otherCharacterNFTs));
        assertEq(session.pitcherTokenID, PitcherTokenID);
        assertEq(session.batterTokenID, BatterTokenID);
    }

    function _try_unstake_and_expect_invalid_state_revert(
        address player,
        address nftAddress,
        uint256 tokenID
    )
        internal
    {
        vm.startPrank(player);

        vm.expectRevert("Fullcount.unstakeNFT: cannot unstake from session in this state");
        game.unstakeNFT(nftAddress, tokenID);

        vm.stopPrank();
    }

    function testRevert_if_trying_unstake_in_state_3() public {
        assertEq(game.sessionProgress(SessionID), 3);

        _try_unstake_and_expect_invalid_state_revert(player1, PitcherNFTAddress, PitcherTokenID);

        _try_unstake_and_expect_invalid_state_revert(player2, BatterNFTAddress, BatterTokenID);
    }

    function testRevert_if_trying_to_unstake_in_state_4() public {
        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(287_349_237_429_034_239_084, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        // Player 2 chooses to make a contact swing in the middle of their strike zone.
        Swing memory swing = Swing(
            239_480_239_842_390_842_390_482_390, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        _try_unstake_and_expect_invalid_state_revert(player1, PitcherNFTAddress, PitcherTokenID);

        _try_unstake_and_expect_invalid_state_revert(player2, BatterNFTAddress, BatterTokenID);
    }

    function test_batter_can_unstake_after_completed_session() public {
        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a contact swing in the middle of their strike zone.
        Swing memory swing = Swing(
            239_480_239_842_390_842_390_482_390, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(287_349_237_429_034_239_084, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 4);

        // Batter reveals first.
        _revealSwing(SessionID, player2, swing);

        _revealPitch(SessionID, player1, pitch);

        assertEq(game.sessionProgress(SessionID), 5);

        Session memory session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, address(0));
        assertEq(session.batterAddress, BatterNFTAddress);
        assertEq(session.pitcherTokenID, 0);
        assertEq(session.batterTokenID, BatterTokenID);

        assertEq(characterNFTs.ownerOf(PitcherTokenID), player1);
        assertEq(otherCharacterNFTs.ownerOf(BatterTokenID), address(game));

        vm.startPrank(player2);

        game.unstakeNFT(BatterNFTAddress, BatterTokenID);

        vm.stopPrank();

        session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, address(0));
        assertEq(session.batterAddress, address(0));
        assertEq(session.pitcherTokenID, 0);
        assertEq(session.batterTokenID, 0);

        assertEq(characterNFTs.ownerOf(PitcherTokenID), player1);
        assertEq(otherCharacterNFTs.ownerOf(BatterTokenID), player2);
    }

    function test_pitcher_can_unstake_after_completed_session() public {
        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a contact swing in the middle of their strike zone.
        Swing memory swing = Swing(
            239_480_239_842_390_842_390_482_390, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(287_349_237_429_034_239_084, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        _revealSwing(SessionID, player2, swing);

        assertEq(game.sessionProgress(SessionID), 5);

        Session memory session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, PitcherNFTAddress);
        assertEq(session.batterAddress, address(0));
        assertEq(session.pitcherTokenID, PitcherTokenID);
        assertEq(session.batterTokenID, 0);

        assertEq(characterNFTs.ownerOf(PitcherTokenID), address(game));
        assertEq(otherCharacterNFTs.ownerOf(BatterTokenID), player2);

        vm.startPrank(player1);

        game.unstakeNFT(PitcherNFTAddress, PitcherTokenID);

        vm.stopPrank();

        session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, address(0));
        assertEq(session.batterAddress, address(0));
        assertEq(session.pitcherTokenID, 0);
        assertEq(session.batterTokenID, 0);

        assertEq(characterNFTs.ownerOf(PitcherTokenID), player1);
        assertEq(otherCharacterNFTs.ownerOf(BatterTokenID), player2);
    }

    function testRevert_if_non_owner_attempts_to_unstake() public {
        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a contact swing in the middle of their strike zone.
        Swing memory swing = Swing(
            239_480_239_842_390_842_390_482_390, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(287_349_237_429_034_239_084, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 4);

        // Batter reveals first.
        _revealSwing(SessionID, player2, swing);
        _revealPitch(SessionID, player1, pitch);

        assertEq(game.sessionProgress(SessionID), 5);

        Session memory session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, address(0));
        assertEq(session.batterAddress, BatterNFTAddress);
        assertEq(session.pitcherTokenID, 0);
        assertEq(session.batterTokenID, BatterTokenID);

        vm.startPrank(randomPerson);

        vm.expectRevert("Fullcount._unstakeNFT: msg.sender is not NFT owner");
        game.unstakeNFT(BatterNFTAddress, BatterTokenID);

        vm.stopPrank();
    }
}

contract FullcountTest_outcomes is FullcountTestBase {
    uint256 SessionID;
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

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        vm.stopPrank();

        vm.startPrank(player2);

        otherCharacterNFTs.approve(address(game), otherTokenID);

        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();

        SessionID = sessionID;
        PitcherNFTAddress = address(characterNFTs);
        PitcherTokenID = tokenID;
        BatterNFTAddress = address(otherCharacterNFTs);
        BatterTokenID = otherTokenID;

        Session memory session = game.getSession(SessionID);
        assertEq(session.pitcherAddress, address(characterNFTs));
        assertEq(session.batterAddress, address(otherCharacterNFTs));
        assertEq(session.pitcherTokenID, PitcherTokenID);
        assertEq(session.batterTokenID, BatterTokenID);
    }

    function test_distance_0_outcome_2() public {
        //  Nonces 2 and 277 generate random number 4457 which is a single.

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(2, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a contact swing in the middle of their strike zone.
        Swing memory swing = Swing(
            277, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SwingRevealed(SessionID, swing);
        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID,
            Outcome.Single,
            PitcherNFTAddress,
            PitcherTokenID,
            BatterNFTAddress,
            BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }    
    
    function test_distance_0_outcome_3() public {
        //  Nonces 3 and 2245 generate random number 4458 which is a double.

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(3, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a contact swing in the middle of their strike zone.
        Swing memory swing = Swing(
            2245, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SwingRevealed(SessionID, swing);
        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID,
            Outcome.Double,
            PitcherNFTAddress,
            PitcherTokenID,
            BatterNFTAddress,
            BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    function test_distance_0_outcome_4() public {
        //  Nonces 4 and 1260 generate random number 5866 which is a double.

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(4, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a contact swing in the middle of their strike zone.
        Swing memory swing = Swing(
            1260, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SwingRevealed(SessionID, swing);
        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID,
            Outcome.Triple,
            PitcherNFTAddress,
            PitcherTokenID,
            BatterNFTAddress,
            BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    function test_distance_0_outcome_5() public {
        //  Nonces 5 and 1904 generate random number 6999 which is a home run.

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(5, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a contact swing in the middle of their strike zone.
        Swing memory swing = Swing(
            1904, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SwingRevealed(SessionID, swing);
        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID,
            Outcome.HomeRun,
            PitcherNFTAddress,
            PitcherTokenID,
            BatterNFTAddress,
            BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    function test_distance_0_outcome_6() public {
        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(6, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a contact swing in the middle of their strike zone.
        Swing memory swing = Swing(
            18702, SwingType.Contact, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SwingRevealed(SessionID, swing);
        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID,
            Outcome.InPlayOut,
            PitcherNFTAddress,
            PitcherTokenID,
            BatterNFTAddress,
            BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }

    function test_distance_1_outcome_0() public {
        //  Nonces 10 and 13750 generate random number 499 which is a strikeout.

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 1 chooses to pitch a fastball over the middle of the plate
        Pitch memory pitch =
            Pitch(10, PitchSpeed.Fast, VerticalLocation.Middle, HorizontalLocation.Middle);
        _commitPitch(SessionID, player1, player1PrivateKey, pitch);

        assertEq(game.sessionProgress(SessionID), 3);

        // Player 2 chooses to make a power swing in the middle of their strike zone.
        Swing memory swing = Swing(
            13750, SwingType.Power, VerticalLocation.Middle, HorizontalLocation.Middle
        );

        _commitSwing(SessionID, player2, player2PrivateKey, swing);

        assertEq(game.sessionProgress(SessionID), 4);

        // Pitcher reveals first.
        _revealPitch(SessionID, player1, pitch);

        vm.startPrank(player2);

        vm.expectEmit(address(game));
        emit SwingRevealed(SessionID, swing);
        vm.expectEmit(address(game));
        emit SessionResolved(
            SessionID,
            Outcome.Strikeout,
            PitcherNFTAddress,
            PitcherTokenID,
            BatterNFTAddress,
            BatterTokenID
        );

        game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

        vm.stopPrank();

        Session memory session = game.getSession(SessionID);
        assertTrue(session.didBatterReveal);

        Swing memory sessionSwing = session.batterReveal;
        assertEq(sessionSwing.nonce, swing.nonce);
        assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
        assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
        assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

        assertEq(game.sessionProgress(SessionID), 5);
    }   
}