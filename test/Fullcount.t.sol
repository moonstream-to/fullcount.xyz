// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console2 } from "../lib/forge-std/src/Test.sol";
import { Fullcount } from "../src/Fullcount.sol";
import {
    PlayerType,
    Session,
    Pitch,
    Swing,
    PitchType,
    SwingType,
    VerticalLocation,
    HorizontalLocation
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
    MockERC20 public feeToken;
    MockERC721 public characterNFTs;
    MockERC721 public otherCharacterNFTs;
    Fullcount public game;

    uint256 sessionStartPrice = 5;
    uint256 sessionJoinPrice = 9;
    uint256 secondsPerPhase = 300;

    uint256 charactersMinted = 0;
    uint256 otherCharactersMinted = 0;

    address treasury = address(0x42);

    uint256 player1PrivateKey = 0x1;
    uint256 player2PrivateKey = 0x2;
    uint256 randomPersonPrivateKey = 0x77;

    address player1 = vm.addr(player1PrivateKey);
    address player2 = vm.addr(player2PrivateKey);
    address randomPerson = vm.addr(randomPersonPrivateKey);

    function signMessageHash(uint256 privateKey, bytes32 messageHash) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, messageHash);
        return abi.encodePacked(r, s, v);
    }

    event SessionStarted(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionJoined(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionAborted(uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID);
    event PitchCommitted(uint256 indexed sessionID);
    event SwingCommitted(uint256 indexed sessionID);

    function setUp() public virtual {
        feeToken = new MockERC20();
        characterNFTs = new MockERC721();
        otherCharacterNFTs = new MockERC721();
        game = new Fullcount(
            address(feeToken),
            sessionStartPrice,
            sessionJoinPrice,
            treasury,
            secondsPerPhase
        );
    }
}

contract FullcountTestDeployment is FullcountTestBase {
    function test_Deployment() public {
        assertEq(game.FullcountVersion(), "0.0.1");
        assertEq(game.FeeTokenAddress(), address(feeToken));
        assertEq(game.SessionStartPrice(), sessionStartPrice);
        assertEq(game.SessionJoinPrice(), sessionJoinPrice);
        assertEq(game.TreasuryAddress(), treasury);
        assertEq(game.SecondsPerPhase(), secondsPerPhase);
        assertEq(game.NumSessions(), 0);
    }
}

/**
 * startSession tests:
 * - [x] fails when game is not approved to transfer character:
 * testRevert_if_game_not_approved_to_transfer_character
 * - [x] fails when game is not approved to transfer fee token: testRevert_if_game_not_approved_to_transfer_fee
 * - [x] fails when player has insufficient fee token: testRevert_if_player_has_insufficient_fee
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
        feeToken.mint(player1, sessionStartPrice);

        uint256 initialNumSessions = game.NumSessions();

        uint256 initialPlayer1FeeBalance = feeToken.balanceOf(player1);
        uint256 initialTreasuryFeeBalance = feeToken.balanceOf(treasury);
        uint256 initialGameFeeBalance = feeToken.balanceOf(address(game));

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);

        vm.expectRevert(
            abi.encodeWithSelector(IERC721Errors.ERC721InsufficientApproval.selector, address(game), tokenID)
        );

        game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);
        assertEq(game.NumSessions(), initialNumSessions);

        assertEq(characterNFTs.ownerOf(tokenID), player1);

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);

        vm.stopPrank();
    }

    function testRevert_if_game_not_approved_to_transfer_fee() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);
        feeToken.mint(player1, sessionStartPrice);

        uint256 initialNumSessions = game.NumSessions();

        uint256 initialPlayer1FeeBalance = feeToken.balanceOf(player1);
        uint256 initialTreasuryFeeBalance = feeToken.balanceOf(treasury);
        uint256 initialGameFeeBalance = feeToken.balanceOf(address(game));

        vm.startPrank(player1);

        feeToken.approve(address(game), 0);
        characterNFTs.approve(address(game), tokenID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientAllowance.selector, address(game), 0, sessionStartPrice
            )
        );
        game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);
        assertEq(game.NumSessions(), initialNumSessions);

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);

        vm.stopPrank();
    }

    function testRevert_if_player_has_insufficient_fee() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);
        feeToken.burn(player1, feeToken.balanceOf(player1));
        feeToken.mint(player1, sessionStartPrice - 1);

        uint256 initialNumSessions = game.NumSessions();

        uint256 initialPlayer1FeeBalance = feeToken.balanceOf(player1);
        uint256 initialTreasuryFeeBalance = feeToken.balanceOf(treasury);
        uint256 initialGameFeeBalance = feeToken.balanceOf(address(game));

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector, player1, sessionStartPrice - 1, sessionStartPrice
            )
        );
        game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);
        assertEq(game.NumSessions(), initialNumSessions);

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);

        vm.stopPrank();
    }

    function test_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);
        feeToken.mint(player1, sessionStartPrice);

        uint256 initialPlayer1FeeBalance = feeToken.balanceOf(player1);
        uint256 initialTreasuryFeeBalance = feeToken.balanceOf(treasury);
        uint256 initialGameFeeBalance = feeToken.balanceOf(address(game));

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
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

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance - sessionStartPrice);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance + sessionStartPrice);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);

        vm.stopPrank();
    }

    function test_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);
        feeToken.mint(player1, sessionStartPrice);

        uint256 initialPlayer1FeeBalance = feeToken.balanceOf(player1);
        uint256 initialTreasuryFeeBalance = feeToken.balanceOf(treasury);
        uint256 initialGameFeeBalance = feeToken.balanceOf(address(game));

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
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

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance - sessionStartPrice);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance + sessionStartPrice);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);

        vm.stopPrank();
    }

    function testRevert_if_transaction_sent_by_random_person() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);
        feeToken.mint(player1, sessionStartPrice);

        uint256 initialPlayer1FeeBalance = feeToken.balanceOf(player1);
        uint256 initialTreasuryFeeBalance = feeToken.balanceOf(treasury);
        uint256 initialGameFeeBalance = feeToken.balanceOf(address(game));
        uint256 initialRandomACcountFeeBalance = feeToken.balanceOf(randomPerson);

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        vm.stopPrank();

        vm.prank(randomPerson);
        vm.expectRevert("Fullcount.startSession: msg.sender is not NFT owner");
        game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        assertEq(characterNFTs.ownerOf(tokenID), player1);

        assertEq(game.NumSessions(), initialNumSessions);

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);
        assertEq(feeToken.balanceOf(randomPerson), initialRandomACcountFeeBalance);
    }
}

/**
 * joinSession tests:
 * - [x] fails when joining non-existent session: testRevert_when_joining_nonexistent_session
 * - [x] fails when joining session that is already full: testRevert_when_session_is_full
 * - [x] fails when joining session in which opponent left prior to joining: testRevert_when_joining_aborted_session
 * - [x] fails when joining on behalf of NFT owner using random account: testRevert_if_msg_sender_not_nft_owner
 * - [x] fails when joiner does not have sufficient fee token:
 * testRevert_when_joiner_has_insufficient_feeToken_balance
 * - [x] fails when joiner has not approved game to transfer sufficient amount of fee token:
 * testRevert_when_joiner_has_not_approved_feeToken_transfer
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

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        uint256 initialPlayer1FeeBalance = feeToken.balanceOf(player1);
        uint256 initialPlayer2FeeBalance = feeToken.balanceOf(player2);
        uint256 initialTreasuryFeeBalance = feeToken.balanceOf(treasury);
        uint256 initialGameFeeBalance = feeToken.balanceOf(address(game));

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        vm.startPrank(player2);
        feeToken.approve(address(game), sessionJoinPrice);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.expectRevert("Fullcount.joinSession: session does not exist");
        game.joinSession(initialNumSessions + 1, address(otherCharacterNFTs), otherTokenID);

        assertEq(game.NumSessions(), initialNumSessions);

        assertEq(otherCharacterNFTs.ownerOf(otherTokenID), player2);

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance);
        assertEq(feeToken.balanceOf(player2), initialPlayer2FeeBalance);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);

        vm.stopPrank();
    }

    function test_as_batter() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        uint256 initialPlayer1FeeBalance = feeToken.balanceOf(player1);
        uint256 initialPlayer2FeeBalance = feeToken.balanceOf(player2);
        uint256 initialTreasuryFeeBalance = feeToken.balanceOf(treasury);
        uint256 initialGameFeeBalance = feeToken.balanceOf(address(game));

        uint256 initialNumSessions = game.NumSessions();

        uint256 initialBlockTimestamp = block.timestamp;
        uint256 startJoinOffsetSeconds = 5;
        uint256 expectedNextPhaseTimestamp = initialBlockTimestamp + startJoinOffsetSeconds;

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        vm.startPrank(player2);
        feeToken.approve(address(game), sessionJoinPrice);
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

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance - sessionStartPrice);
        assertEq(feeToken.balanceOf(player2), initialPlayer2FeeBalance - sessionJoinPrice);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance + sessionStartPrice + sessionJoinPrice);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);

        vm.stopPrank();
    }

    function test_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        uint256 initialPlayer1FeeBalance = feeToken.balanceOf(player1);
        uint256 initialPlayer2FeeBalance = feeToken.balanceOf(player2);
        uint256 initialTreasuryFeeBalance = feeToken.balanceOf(treasury);
        uint256 initialGameFeeBalance = feeToken.balanceOf(address(game));

        uint256 initialNumSessions = game.NumSessions();

        uint256 initialBlockTimestamp = block.timestamp;
        uint256 startJoinOffsetSeconds = 500;
        uint256 expectedNextPhaseTimestamp = initialBlockTimestamp + startJoinOffsetSeconds;

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.startPrank(player2);
        feeToken.approve(address(game), sessionJoinPrice);
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

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance - sessionStartPrice);
        assertEq(feeToken.balanceOf(player2), initialPlayer2FeeBalance - sessionJoinPrice);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance + sessionStartPrice + sessionJoinPrice);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);

        vm.stopPrank();
    }

    function testRevert_when_joiner_has_insufficient_feeToken_balance() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        feeToken.mint(player1, sessionStartPrice);
        feeToken.burn(player2, feeToken.balanceOf(player2));

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.startPrank(player2);
        feeToken.approve(address(game), sessionJoinPrice);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, player2, 0, sessionJoinPrice)
        );
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();
    }

    function testRevert_when_joiner_has_not_approved_feeToken_transfer() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.startPrank(player2);
        feeToken.approve(address(game), 0);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, address(game), 0, sessionJoinPrice)
        );
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();
    }

    function testRevert_when_joiner_has_not_approved_nft_transfer() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;

        otherCharactersMinted++;
        uint256 otherTokenID = otherCharactersMinted;

        characterNFTs.mint(player1, tokenID);
        otherCharacterNFTs.mint(player2, otherTokenID);

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.startPrank(player2);
        feeToken.approve(address(game), sessionJoinPrice);

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

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        vm.startPrank(player2);
        feeToken.approve(address(game), sessionJoinPrice);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.expectEmit(address(game));
        emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Batter);
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        vm.stopPrank();

        otherCharactersMinted++;
        uint256 nextOtherTokenID = otherCharactersMinted;
        otherCharacterNFTs.mint(randomPerson, nextOtherTokenID);

        feeToken.mint(randomPerson, sessionJoinPrice);

        vm.startPrank(randomPerson);

        feeToken.approve(address(game), sessionJoinPrice);
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

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.startPrank(player2);
        feeToken.approve(address(game), sessionJoinPrice);
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

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        game.abortSession(sessionID);

        vm.stopPrank();

        assertEq(game.sessionProgress(sessionID), 1);

        vm.startPrank(player2);

        feeToken.approve(address(game), sessionJoinPrice);
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
        feeToken.mint(player1, sessionStartPrice);

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
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
        feeToken.mint(player1, sessionStartPrice);

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
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
        feeToken.mint(player1, sessionStartPrice);

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
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
        feeToken.mint(player1, sessionStartPrice);

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
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

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.stopPrank();

        vm.startPrank(player2);

        feeToken.approve(address(game), sessionJoinPrice);
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
 * - [ ] fails if commitment already exists (pitch):
 * - [ ] fails if commitment already exists (swing):
 * - [ ] fails if session is still in the "join" phase (i.e. it hasn't been joined by second player):
 * - [ ] fails if someone other than staker attempts commitment (pitch):
 * - [ ] fails if someone other than staker attempts commitment (swing):
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

        feeToken.mint(player1, sessionStartPrice);
        feeToken.mint(player2, sessionJoinPrice);

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        vm.stopPrank();

        vm.startPrank(player2);

        feeToken.approve(address(game), sessionJoinPrice);
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
        PitchType pitcherPitch = PitchType.Fastball;
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

        vm.expectEmit(address(game));
        emit SwingCommitted(SessionID);
        game.commitSwing(SessionID, batterCommitment);

        vm.stopPrank();

        assertEq(game.sessionProgress(SessionID), 4);

        session = game.getSession(SessionID);

        assertTrue(session.didPitcherCommit);
        assertTrue(session.didBatterCommit);

        assertEq(session.pitcherCommit, pitcherCommitment);
        assertEq(session.batterCommit, batterCommitment);
    }
}
