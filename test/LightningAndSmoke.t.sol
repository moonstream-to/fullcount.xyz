// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console2 } from "../lib/forge-std/src/Test.sol";
import { LightningAndSmoke } from "../src/LightningAndSmoke.sol";
import { PlayerType, Session, Pitch, Swing, PitchType, SwingType } from "../src/data.sol";
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

contract LSTestBase is Test {
    MockERC20 public feeToken;
    MockERC721 public characterNFTs;
    MockERC721 public otherCharacterNFTs;
    LightningAndSmoke public game;

    uint256 sessionStartPrice = 5;
    uint256 sessionJoinPrice = 9;
    uint256 blocksPerPhase = 10;

    uint256 charactersMinted = 0;
    uint256 otherCharactersMinted = 0;

    address treasury = address(0x42);
    address player1 = address(0x1);
    address player2 = address(0x2);
    address randomACcount = address(0x77);

    event SessionStarted(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionJoined(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );

    function setUp() public {
        feeToken = new MockERC20();
        characterNFTs = new MockERC721();
        otherCharacterNFTs = new MockERC721();
        game = new LightningAndSmoke(
            address(feeToken),
            sessionStartPrice,
            sessionJoinPrice,
            treasury,
            blocksPerPhase
        );
    }
}

contract LSTestDeployment is LSTestBase {
    function test_Deployment() public {
        assertEq(game.FeeTokenAddress(), address(feeToken));
        assertEq(game.SessionStartPrice(), sessionStartPrice);
        assertEq(game.SessionJoinPrice(), sessionJoinPrice);
        assertEq(game.TreasuryAddress(), treasury);
        assertEq(game.BlocksPerPhase(), blocksPerPhase);
        assertEq(game.NumSessions(), 0);
    }
}

contract LSTest_startSession is LSTestBase {
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
        assertEq(session.startBlock, block.number);
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
        assertEq(session.startBlock, block.number);
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
        uint256 initialRandomACcountFeeBalance = feeToken.balanceOf(randomACcount);

        uint256 initialNumSessions = game.NumSessions();

        vm.startPrank(player1);

        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        vm.stopPrank();

        vm.prank(randomACcount);
        vm.expectRevert("LightningAndSmoke.startSession: msg.sender is not NFT owner");
        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);

        assertEq(characterNFTs.ownerOf(tokenID), player1);

        assertEq(game.NumSessions(), initialNumSessions);

        assertEq(feeToken.balanceOf(player1), initialPlayer1FeeBalance);
        assertEq(feeToken.balanceOf(treasury), initialTreasuryFeeBalance);
        assertEq(feeToken.balanceOf(address(game)), initialGameFeeBalance);
        assertEq(feeToken.balanceOf(randomACcount), initialRandomACcountFeeBalance);
    }
}

contract LSTest_joinSession is LSTestBase {
    /**
     * joinSession tests:
     * - [x] fails when joining non-existent session: testRevert_when_joining_nonexistent_session
     * - [ ] fails when joining session that is already full
     * - [ ] fails when joining session in which opponent left prior to joining
     * - [ ] fails when joining on behalf of NFT owner using random account
     * - [ ] fails when joiner does not have sufficient fee token
     * - [ ] fails when joiner has not approved game to transfer sufficient amount of fee token
     * - [ ] fails when joiner has not approved game to transfer character
     * - [x] succeeds when joining session as pitcher: test_as_pitcher
     * - [x] succeeds when joining session as batter: test_as_batter
     */

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

        vm.expectRevert("LightningAndSmoke.joinSession: session does not exist");
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

        assertEq(game.NumSessions(), initialNumSessions + 1);

        Session memory session = game.getSession(sessionID);
        assertEq(session.startBlock, block.number);
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

        vm.startPrank(player1);
        feeToken.approve(address(game), sessionStartPrice);
        characterNFTs.approve(address(game), tokenID);

        uint256 sessionID = game.startSession(address(characterNFTs), tokenID, PlayerType.Batter);

        vm.startPrank(player2);
        feeToken.approve(address(game), sessionJoinPrice);
        otherCharacterNFTs.approve(address(game), otherTokenID);

        vm.expectEmit(address(game));
        emit SessionJoined(sessionID, address(otherCharacterNFTs), otherTokenID, PlayerType.Pitcher);
        game.joinSession(sessionID, address(otherCharacterNFTs), otherTokenID);

        assertEq(game.NumSessions(), initialNumSessions + 1);

        Session memory session = game.getSession(sessionID);
        assertEq(session.startBlock, block.number);
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
}