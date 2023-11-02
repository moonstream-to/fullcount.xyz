// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.19;

import { IERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import { SafeERC20 } from "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import { StatBlockBase } from "../lib/web3/contracts/stats/StatBlock.sol";

import {
    PlayerType, PitchType, SwingType, VerticalLocation, HorizontalLocation, Session, Pitch, Swing
} from "./data.sol";

/*
LightningAndSmoke implements a simple game in which two NFTs (from any ERC721 contracts) complete against
each other in a single pitch of baseball. One NFT acts as the pitcher, the other one acts as the batter,
and they face off with the game tied, the bases loaded, a full count, and two outs in the bottom of the 9th
inning.

The ball will not go foul. Either the pitcher gets the batter out or the batter wins the game.

Authors: Moonstream (https://moonstream.to)

Functionality:
- [ ] Game is played by NFTs from *any* collection.
- [ ] All NFTs start with stats of 0 and improve their stats by playing sessions of Lightning and Smoke.
- [ ] Player can start a session as pitcher or batter.
- [ ] Player can stake into existing session as pitcher or batter - complement of the role that was staked
      to start the session.
- [ ] When a pitcher and batter are staked into a session, the session automatically starts.
- [ ] Staking a character into a session costs either native tokens or ERC20 tokens. Starting a session
      can have a different price than joining an existing session. In general, we will keep it cheaper
      to start a session than to join a sesion that someone else started -- this will incentivize many
      matches. The cost will disincentivize bots grinding against themselves. The contract is deployed
      with `feeTokenAddress`, `sessionStartPrice`, `sessionJoinPrice`, and `treasuryAddress` parameters.
      Prices are transferred to the `treasuryAddress` when a session is either started or joined.
- [ ] Once a session starts, both the pitcher and the batter can commit their moves.
- [ ] Commitments are signed EIP712 messages representing the moves.
- [ ] LightningAndSmoke contract is deployed with a `blocksPerPhase` parameter. If one player commits
      their move but the other one does not commit their move before `blocksPerPhase` blocks have
      elapsed since the session started, then the first player wins by forfeit. They can submit a
      transaction to end the session, unstake their NFT, and earn their reward.
- [ ] A player can unstake their NFT from a session if the session has either not started or if the session
      has completed.
- [ ] If both players commit their moves before `blocksPerPhase` blocks have elapsed since the session
      started, then the session enters the "reveal" phase. In this phase, each player has `blocksPerPhase`
      blocks to reveal their moves. They do this by submitting the EIP712 messages that were signed
      to generate their commits. The session is resolved once the second player reveals their move (in the
      same transaction).
- [ ] If one player reveals their move before `blocksPerPhase` blocks have passed since the second
      commit but the other one doesn't, then the player who revealed wins by default.
- [ ] If neither player reveals their move before `blocksPerPhase` blocks have passed since the
      second commit, then the session is cancelled and both players may unstake their NFTs.
 */
contract LightningAndSmoke is StatBlockBase {
    using SafeERC20 for IERC20;

    address public FeeTokenAddress;
    uint256 public SessionStartPrice;
    uint256 public SessionJoinPrice;
    address public TreasuryAddress;
    uint256 public BlocksPerPhase;

    uint256 public NumSessions;

    // Session ID => session state
    // NOTE: Sessions are 1-indexed
    mapping(uint256 => Session) public SessionState;

    // ERC721 address => ERC721 token ID => address of player who staked that character into the Lightning and Smoke
    // contract
    mapping(address => mapping(uint256 => address)) public Staker;

    // ERC721 address => ERC721 token ID => session that that character is staked into
    // NOTE: Sessions are 1-indexed
    mapping(address => mapping(uint256 => uint256)) public StakedSession;

    event SessionStarted(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionJoined(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionExited(uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID);

    constructor(
        address feeTokenAddress,
        uint256 sessionStartPrice,
        uint256 sessionJoinPrice,
        address treasuryAddress,
        uint256 blocksPerPhase
    ) {
        FeeTokenAddress = feeTokenAddress;
        SessionStartPrice = sessionStartPrice;
        SessionJoinPrice = sessionJoinPrice;
        TreasuryAddress = treasuryAddress;
        BlocksPerPhase = blocksPerPhase;
    }

    // This is useful because of how return values from the public mapping get serialized.
    function getSession(uint256 sessionID) external view returns (Session memory) {
        return SessionState[sessionID];
    }

    // LightningAndSmoke is an autnonomous game, and so the only administrator for NFT stats is the
    // LightningAndSmoke contract itself.
    // This is an override of the StatBlockBase.isAdministrator function.
    function isAdministrator(address account) public view override returns (bool) {
        return account == address(this);
    }

    // Emits:
    // - SessionStarted
    function startSession(address nftAddress, uint256 tokenID, PlayerType role) public virtual returns (uint256) {
        IERC20 feeToken = IERC20(FeeTokenAddress);
        IERC721 nftContract = IERC721(nftAddress);
        address currentOwner = nftContract.ownerOf(tokenID);

        require(msg.sender == currentOwner, "LightningAndSmoke.startSession: msg.sender is not NFT owner");

        feeToken.safeTransferFrom(msg.sender, TreasuryAddress, SessionStartPrice);

        // Increment NumSessions. The new value is the ID of the session that was just started.
        // This is what makes sessions 1-indexed.
        NumSessions++;

        if (role == PlayerType.Pitcher) {
            SessionState[NumSessions].pitcherAddress = nftAddress;
            SessionState[NumSessions].pitcherTokenID = tokenID;
        } else {
            SessionState[NumSessions].batterAddress = nftAddress;
            SessionState[NumSessions].batterTokenID = tokenID;
        }

        Staker[nftAddress][tokenID] = currentOwner;
        StakedSession[nftAddress][tokenID] = NumSessions;

        SessionState[NumSessions].startBlock = block.number;

        nftContract.transferFrom(currentOwner, address(this), tokenID);

        emit SessionStarted(NumSessions, nftAddress, tokenID, role);

        return NumSessions;
    }

    // Emits:
    // - SessionJoined
    function joinSession(uint256 sessionID, address nftAddress, uint256 tokenID) public virtual {
        require(sessionID <= NumSessions, "LightningAndSmoke.joinSession: session does not exist");

        IERC20 feeToken = IERC20(FeeTokenAddress);
        IERC721 nftContract = IERC721(nftAddress);
        address currentOwner = nftContract.ownerOf(tokenID);

        require(msg.sender == currentOwner, "LightningAndSmoke.joinSession: msg.sender is not NFT owner");

        feeToken.safeTransferFrom(msg.sender, TreasuryAddress, SessionJoinPrice);

        Session storage session = SessionState[sessionID];
        if (session.pitcherAddress != address(0) && session.batterAddress != address(0)) {
            revert("LightningAndSmoke.joinSession: session is already full");
        } else if (session.pitcherAddress == address(0) && session.batterAddress == address(0)) {
            revert("LightningAndSmoke.joinSession: opponent left session");
        }

        PlayerType role = PlayerType.Pitcher;
        if (session.batterAddress == address(0)) {
            role = PlayerType.Batter;
            session.batterAddress = nftAddress;
            session.batterTokenID = tokenID;
        } else {
            session.pitcherAddress = nftAddress;
            session.pitcherTokenID = tokenID;
        }

        Staker[nftAddress][tokenID] = currentOwner;
        StakedSession[nftAddress][tokenID] = sessionID;

        nftContract.transferFrom(currentOwner, address(this), tokenID);

        emit SessionJoined(sessionID, nftAddress, tokenID, role);
    }
}
