// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "../lib/forge-std/src/Test.sol";
import {LightningAndSmoke} from "../src/LightningAndSmoke.sol";
import {PlayerType, Session, Pitch, Swing} from "../src/data.sol";
import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {ERC721} from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {IERC721Errors} from "../lib/openzeppelin-contracts/contracts/interfaces/draft-IERC6093.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("test", "test") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }
}

contract MockERC721 is ERC721 {
    constructor() ERC721("test", "test") {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }
}

contract TestLightningAndSmoke is LightningAndSmoke {
    constructor(
        address feeTokenAddress,
        uint256 sessionStartPrice,
        uint256 sessionJoinPrice,
        address treasuryAddress,
        uint256 blocksPerPhase
    )
        LightningAndSmoke(
            feeTokenAddress,
            sessionStartPrice,
            sessionJoinPrice,
            treasuryAddress,
            blocksPerPhase
        )
    {}

    function sessionStartBlock(
        uint256 sessionID
    ) external view returns (uint256) {
        return SessionState[sessionID].startBlock;
    }

    function sessionPitcherAddress(
        uint256 sessionID
    ) external view returns (address) {
        return SessionState[sessionID].pitcherAddress;
    }

    function sessionPitcherTokenID(
        uint256 sessionID
    ) external view returns (uint256) {
        return SessionState[sessionID].pitcherTokenID;
    }

    function sessionBatterAddress(
        uint256 sessionID
    ) external view returns (address) {
        return SessionState[sessionID].batterAddress;
    }

    function sessionBatterTokenID(
        uint256 sessionID
    ) external view returns (uint256) {
        return SessionState[sessionID].batterTokenID;
    }
}

contract LightningAndSmokeTest is Test {
    MockERC20 public feeToken;
    MockERC721 public characterNFTs;
    MockERC721 public otherCharacterNFTs;
    TestLightningAndSmoke public game;

    uint256 sessionStartPrice = 5;
    uint256 sessionJoinPrice = 9;
    uint256 blocksPerPhase = 10;

    uint256 charactersMinted = 0;
    uint256 otherCharactersMinted = 0;

    address treasury = address(0x42);
    address player1 = address(0x1);
    address player2 = address(0x2);

    event SessionStarted(
        uint256 indexed sessionID,
        address indexed nftAddress,
        uint256 indexed tokenID,
        PlayerType role
    );

    function setUp() public {
        feeToken = new MockERC20();
        characterNFTs = new MockERC721();
        otherCharacterNFTs = new MockERC721();
        game = new TestLightningAndSmoke(
            address(feeToken),
            sessionStartPrice,
            sessionJoinPrice,
            treasury,
            blocksPerPhase
        );
    }

    function test_Deployment() public {
        assertEq(game.FeeTokenAddress(), address(feeToken));
        assertEq(game.SessionStartPrice(), sessionStartPrice);
        assertEq(game.SessionJoinPrice(), sessionJoinPrice);
        assertEq(game.TreasuryAddress(), treasury);
        assertEq(game.BlocksPerPhase(), blocksPerPhase);
        assertEq(game.NumSessions(), 0);
    }

    error ERC721InsufficientApproval(address, uint256);

    function testRevert_startSession_fails_if_game_not_approved_to_transfer_character()
        public
    {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721InsufficientApproval.selector,
                address(game),
                tokenID
            )
        );
        vm.prank(player1);
        game.startSession(address(characterNFTs), tokenID, PlayerType.Pitcher);
        assertEq(game.NumSessions(), initialNumSessions);
    }

    function test_startSession_as_pitcher() public {
        charactersMinted++;
        uint256 tokenID = charactersMinted;
        characterNFTs.mint(player1, tokenID);

        uint256 initialNumSessions = game.NumSessions();

        vm.prank(player1);
        characterNFTs.approve(address(game), tokenID);

        vm.expectEmit(address(game));
        emit SessionStarted(
            initialNumSessions + 1,
            address(characterNFTs),
            tokenID,
            PlayerType.Pitcher
        );
        uint256 sessionID = game.startSession(
            address(characterNFTs),
            tokenID,
            PlayerType.Pitcher
        );

        uint256 terminalNumSessions = game.NumSessions();
        assertEq(sessionID, terminalNumSessions);
        assertEq(terminalNumSessions, initialNumSessions + 1);
        assertEq(game.sessionStartBlock(sessionID), block.number);
        assertEq(game.sessionPitcherAddress(sessionID), address(characterNFTs));
        assertEq(game.sessionPitcherTokenID(sessionID), tokenID);
        assertEq(game.sessionBatterAddress(sessionID), address(0));
        assertEq(game.sessionBatterTokenID(sessionID), 0);
    }
}
