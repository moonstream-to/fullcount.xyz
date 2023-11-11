// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.19;

import { EIP712 } from "../lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";
import { IERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import { SignatureChecker } from "../lib/openzeppelin-contracts/contracts/utils/cryptography/SignatureChecker.sol";
import { StatBlockBase } from "../lib/web3/contracts/stats/StatBlock.sol";

import {
    PlayerType,
    PitchSpeed,
    SwingType,
    VerticalLocation,
    HorizontalLocation,
    Session,
    Pitch,
    Swing,
    Outcome
} from "./data.sol";

/*
Fullcount implements a simple game in which two NFTs (from any ERC721 contracts) complete against
each other in a single pitch of baseball. One NFT acts as the pitcher, the other one acts as the batter,
and they face off with the game tied, the bases loaded, a full count, and two outs in the bottom of the 9th
inning.

The ball will not go foul. Either the pitcher gets the batter out or the batter wins the game.

Authors: Moonstream (https://moonstream.to)

Functionality:
- [x] Game is played by NFTs from *any* collection.
- [ ] All NFTs start with stats of 0 and improve their stats by playing sessions of Fullcount.
- [x] Player can start a session as pitcher or batter.
- [x] Player can stake into existing session as pitcher or batter - complement of the role that was staked
      to start the session. (joinSession automatically chooses the role of the joining player)
- [x] When a pitcher and batter are staked into a session, the session automatically starts.
- [x] Once a session starts, both the pitcher and the batter can commit their moves.
- [x] Commitments are signed EIP712 messages representing the moves.
- [x] Fullcount contract is deployed with a `secondsPerPhase` parameter. If one player commits
      their move but the other one does not commit their move before `secondsPerPhase` blocks have
      elapsed since the session started, then the first player wins by forfeit. They can submit a
      transaction to end the session, unstake their NFT, and earn their reward.
- [x] A player can unstake their NFT from a session if the session has either not started or if the session
      has completed.
- [x] If both players commit their moves before `secondsPerPhase` blocks have elapsed since the session
      started, then the session enters the "reveal" phase. In this phase, each player has `secondsPerPhase`
      blocks to reveal their moves. They do this by submitting the EIP712 messages that were signed
      to generate their commits. The session is resolved once the second player reveals their move (in the
      same transaction).
- [ ] If one player reveals their move before `secondsPerPhase` blocks have passed since the second
      commit but the other one doesn't, then the player who revealed wins by default.
- [x] If neither player reveals their move before `secondsPerPhase` blocks have passed since the
      second commit, then the session is cancelled and both players may unstake their NFTs.
 */
contract Fullcount is StatBlockBase, EIP712 {
    string public constant FullcountVersion = "0.0.1";

    uint256 public SecondsPerPhase;

    uint256 public NumSessions;

    uint256[7] public Distance0Distribution = [0, 0, 4458, 1408, 126, 1008, 3000];
    uint256[7] public Distance1Distribution = [500, 0, 3185, 1005, 90, 720, 4500];
    uint256[7] public Distance2Distribution = [2000, 0, 1910, 603, 55, 432, 5000];
    uint256[7] public DistanceGT2Distribution = [6000, 0, 636, 201, 19, 144, 3000];

    // Session ID => session state
    // NOTE: Sessions are 1-indexed
    mapping(uint256 => Session) public SessionState;

    // ERC721 address => ERC721 token ID => address of player who staked that character into the Fullcount
    // contract
    mapping(address => mapping(uint256 => address)) public Staker;

    // ERC721 address => ERC721 token ID => session that that character is staked into
    // NOTE: Sessions are 1-indexed
    mapping(address => mapping(uint256 => uint256)) public StakedSession;

    event FullcountDeployed(string indexed version, uint256 SecondsPerPhase);
    event SessionStarted(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionJoined(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionExited(uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID);
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

    constructor(uint256 secondsPerPhase) EIP712("Fullcount", FullcountVersion) {
        SecondsPerPhase = secondsPerPhase;
        emit FullcountDeployed(FullcountVersion, secondsPerPhase);
    }

    // This is useful because of how return values from the public mapping get serialized.
    function getSession(uint256 sessionID) external view returns (Session memory) {
        return SessionState[sessionID];
    }

    /**
     * Return values:
     * 0 - session does not exist
     * 1 - session aborted
     * 2 - session started, but second player has not yet joined
     * 3 - session started, both players joined, ready for commitments
     * 4 - both players committed, ready for reveals
     * 5 - session complete
     * 6 - session expired
     *
     * All session expiration logic should go through a `_sessionProgress(sessionID) == 6` check.
     */
    function _sessionProgress(uint256 sessionID) internal view returns (uint256) {
        if (sessionID > NumSessions) {
            return 0;
        }

        Session storage session = SessionState[sessionID];
        if (session.didPitcherReveal && session.didBatterReveal) {
            return 5;
        } else if (session.pitcherAddress == address(0) && session.batterAddress == address(0)) {
            return 1;
        } else if (session.pitcherAddress == address(0) || session.batterAddress == address(0)) {
            return 2;
        } else if (!session.didPitcherCommit || !session.didBatterCommit) {
            if (session.phaseStartTimestamp + SecondsPerPhase < block.timestamp) {
                return 6;
            }
            return 3;
        } else if (!session.didPitcherReveal || !session.didBatterReveal) {
            if (session.phaseStartTimestamp + SecondsPerPhase < block.timestamp) {
                return 6;
            }
            return 4;
        }

        revert("Fullcount._sessionProgress: idiot programmer");
    }

    function sessionProgress(uint256 sessionID) public view returns (uint256) {
        return _sessionProgress(sessionID);
    }

    // Fullcount is an autnonomous game, and so the only administrator for NFT stats is the
    // Fullcount contract itself.
    // This is an override of the StatBlockBase.isAdministrator function.
    function isAdministrator(address account) public view override returns (bool) {
        return account == address(this);
    }

    // Emits:
    // - SessionStarted
    function startSession(address nftAddress, uint256 tokenID, PlayerType role) external virtual returns (uint256) {
        IERC721 nftContract = IERC721(nftAddress);
        address currentOwner = nftContract.ownerOf(tokenID);

        require(msg.sender == currentOwner, "Fullcount.startSession: msg.sender is not NFT owner");

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

        SessionState[NumSessions].phaseStartTimestamp = block.timestamp;

        nftContract.transferFrom(currentOwner, address(this), tokenID);

        emit SessionStarted(NumSessions, nftAddress, tokenID, role);

        return NumSessions;
    }

    // Emits:
    // - SessionJoined
    function joinSession(uint256 sessionID, address nftAddress, uint256 tokenID) external virtual {
        require(sessionID <= NumSessions, "Fullcount.joinSession: session does not exist");

        IERC721 nftContract = IERC721(nftAddress);
        address currentOwner = nftContract.ownerOf(tokenID);

        require(msg.sender == currentOwner, "Fullcount.joinSession: msg.sender is not NFT owner");

        Session storage session = SessionState[sessionID];
        if (session.pitcherAddress != address(0) && session.batterAddress != address(0)) {
            revert("Fullcount.joinSession: session is already full");
        } else if (session.pitcherAddress == address(0) && session.batterAddress == address(0)) {
            revert("Fullcount.joinSession: opponent left session");
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

        session.phaseStartTimestamp = block.timestamp;

        Staker[nftAddress][tokenID] = currentOwner;
        StakedSession[nftAddress][tokenID] = sessionID;

        nftContract.transferFrom(currentOwner, address(this), tokenID);

        emit SessionJoined(sessionID, nftAddress, tokenID, role);
    }

    function _unstakeNFT(address nftAddress, uint256 tokenID) internal {
        uint256 stakedSessionID = StakedSession[nftAddress][tokenID];
        require(stakedSessionID > 0, "Fullcount._unstakeNFT: NFT is not staked");

        address tokenOwner = Staker[nftAddress][tokenID];

        require(msg.sender == tokenOwner, "Fullcount._unstakeNFT: msg.sender is not NFT owner");

        IERC721 nftContract = IERC721(nftAddress);
        nftContract.transferFrom(address(this), tokenOwner, tokenID);

        if (
            SessionState[stakedSessionID].pitcherAddress == nftAddress
                && SessionState[stakedSessionID].pitcherTokenID == tokenID
        ) {
            SessionState[stakedSessionID].pitcherAddress = address(0);
            SessionState[stakedSessionID].pitcherTokenID = 0;
        } else if (
            SessionState[stakedSessionID].batterAddress == nftAddress
                && SessionState[stakedSessionID].batterTokenID == tokenID
        ) {
            SessionState[stakedSessionID].batterAddress = address(0);
            SessionState[stakedSessionID].batterTokenID = 0;
        } else {
            revert("Fullcount._unstakeNFT: idiot programmer");
        }

        StakedSession[nftAddress][tokenID] = 0;
        Staker[nftAddress][tokenID] = address(0);
    }

    function unstakeNFT(address nftAddress, uint256 tokenID) external {
        uint256 stakedSessionID = StakedSession[nftAddress][tokenID];
        require(stakedSessionID > 0, "Fullcount._unstakeNFT: NFT is not staked");

        uint256 progress = _sessionProgress(stakedSessionID);
        require(progress == 5 || progress == 6, "Fullcount.unstakeNFT: cannot unstake from session in this state");

        _unstakeNFT(nftAddress, tokenID);
    }

    /**
     * Players who have started a session but who have not yet had an opponent join their session can choose
     * to abort the session and unstake their characters.
     */
    function abortSession(uint256 sessionID) external {
        require(_sessionProgress(sessionID) == 2, "Fullcount.abortSession: cannot abort from session in this state");

        // In each branch, we emit SessionAborted before unstaking because unstaking changes SessionState.
        if (SessionState[sessionID].pitcherAddress != address(0)) {
            emit SessionAborted(
                sessionID, SessionState[sessionID].pitcherAddress, SessionState[sessionID].pitcherTokenID
            );
            _unstakeNFT(SessionState[sessionID].pitcherAddress, SessionState[sessionID].pitcherTokenID);
        } else if (SessionState[sessionID].batterAddress != address(0)) {
            emit SessionAborted(sessionID, SessionState[sessionID].batterAddress, SessionState[sessionID].batterTokenID);
            _unstakeNFT(SessionState[sessionID].batterAddress, SessionState[sessionID].batterTokenID);
        } else {
            revert("Fullcount.abortSession: idiot programmer");
        }

        require(_sessionProgress(sessionID) == 1, "Fullcount.abortSession: incorrect _sessionProgress");
    }

    function pitchHash(
        uint256 nonce,
        PitchSpeed speed,
        VerticalLocation vertical,
        HorizontalLocation horizontal
    )
        public
        view
        returns (bytes32)
    {
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("PitchMessage(uint256 nonce,uint256 speed,uint256 vertical,uint256 horizontal)"),
                nonce,
                uint256(speed),
                uint256(vertical),
                uint256(horizontal)
            )
        );
        return _hashTypedDataV4(structHash);
    }

    function swingHash(
        uint256 nonce,
        SwingType kind,
        VerticalLocation vertical,
        HorizontalLocation horizontal
    )
        public
        view
        returns (bytes32)
    {
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("SwingMessage(uint256 nonce,uint256 kind,uint256 vertical,uint256 horizontal)"),
                nonce,
                uint256(kind),
                uint256(vertical),
                uint256(horizontal)
            )
        );
        return _hashTypedDataV4(structHash);
    }

    /**
     * TODO: Should we allow commitments by the first character even if a second character has not
     * yet joined the session?
     * This doesn't really make a difference on the technical implementation (besides slight increase
     * in complexity), but it could cheapen the game play experience.
     * The current implementation forces both players to be *present* in some way while the game is
     * in session. The current setup encourages both players to think about each other when they
     * decide their moves.
     */

    /**
     * TODO: Should we allow players to change their commitments before the first reveal has taken
     * place?
     * Just as with the decision about making commitments before the session has been joined by the
     * second player, the technical implementation is easy but doing this could cheapen the gameplay
     * experience.
     * I like the way we have it implemented now, where a player can only commit once per character.
     * It gives the commitment a sense of urgency, immediacy, and gravity.
     */

    function commitPitch(uint256 sessionID, bytes memory signature) external {
        uint256 progress = _sessionProgress(sessionID);
        if (progress == 6) {
            revert("Fullcount.commitPitch: session has expired");
        }
        require(progress == 3, "Fullcount.commitPitch: cannot commit in current state");

        Session storage session = SessionState[sessionID];

        require(
            msg.sender == Staker[session.pitcherAddress][session.pitcherTokenID],
            "Fullcount.commitPitch: msg.sender did not stake pitcher"
        );

        require(!session.didPitcherCommit, "Fullcount.commitPitch: pitcher already committed");

        session.didPitcherCommit = true;
        session.pitcherCommit = signature;

        if (session.didPitcherCommit && session.didBatterCommit) {
            session.phaseStartTimestamp = block.timestamp;
        }

        emit PitchCommitted(sessionID);
    }

    function commitSwing(uint256 sessionID, bytes memory signature) external {
        uint256 progress = _sessionProgress(sessionID);
        if (progress == 6) {
            revert("Fullcount.commitSwing: session has expired");
        }
        require(progress == 3, "Fullcount.commitSwing: cannot commit in current state");

        Session storage session = SessionState[sessionID];

        require(
            msg.sender == Staker[session.batterAddress][session.batterTokenID],
            "Fullcount.commitSwing: msg.sender did not stake batter"
        );

        require(!session.didBatterCommit, "Fullcount.commitSwing: batter already committed");

        session.didBatterCommit = true;
        session.batterCommit = signature;

        if (session.didPitcherCommit && session.didBatterCommit) {
            session.phaseStartTimestamp = block.timestamp;
        }

        emit SwingCommitted(sessionID);
    }

    // Internal method gets inlined into contract methods
    function _randomSample(uint256 nonce0, uint256 nonce1, uint256 totalMass) internal pure returns (uint256 sample) {
        // Combining the nonces this way prevents overflow concerns when adding two nonces >= 2^255
        sample = uint256(keccak256(abi.encode(nonce0, nonce1))) % totalMass;
    }

    // External method makes it easy to test randomness for the purposes of game clients
    function randomSample(uint256 nonce0, uint256 nonce1, uint256 totalMass) external pure returns (uint256) {
        return _randomSample(nonce0, nonce1, totalMass);
    }

    function sampleOutcomeFromDistribution(
        uint256 nonce0,
        uint256 nonce1,
        uint256[7] memory distribution
    )
        public
        pure
        returns (Outcome)
    {
        uint256 totalMass = distribution[0] + distribution[1] + distribution[2] + distribution[3] + distribution[4]
            + distribution[5] + distribution[6];

        uint256 sample = _randomSample(nonce0, nonce1, totalMass);

        uint256 cumulativeMass = distribution[0];
        if (sample < cumulativeMass) {
            return Outcome.Strikeout;
        }

        cumulativeMass += distribution[1];
        if (sample < cumulativeMass) {
            return Outcome.Walk;
        }

        cumulativeMass += distribution[2];
        if (sample < cumulativeMass) {
            return Outcome.Single;
        }

        cumulativeMass += distribution[3];
        if (sample < cumulativeMass) {
            return Outcome.Double;
        }

        cumulativeMass += distribution[4];
        if (sample < cumulativeMass) {
            return Outcome.Triple;
        }

        cumulativeMass += distribution[5];
        if (sample < cumulativeMass) {
            return Outcome.HomeRun;
        }

        return Outcome.InPlayOut;
    }

    function _l1_distance(Pitch memory pitch, Swing memory swing) internal pure returns (uint256) {
        require(swing.kind != SwingType.Take, "Fullcount._l1_distance: Not defined when batter takes");
        uint256 dist = 0;
        uint256 pitchParam = 0;
        uint256 swingParam = 0;

        pitchParam = uint256(pitch.speed);
        swingParam = uint256(swing.kind);
        if (pitchParam <= swingParam) {
            dist += (swingParam - pitchParam);
        } else {
            dist += (pitchParam - swingParam);
        }

        pitchParam = uint256(pitch.vertical);
        swingParam = uint256(swing.vertical);
        if (pitchParam <= swingParam) {
            dist += (swingParam - pitchParam);
        } else {
            dist += (pitchParam - swingParam);
        }

        pitchParam = uint256(pitch.horizontal);
        swingParam = uint256(swing.horizontal);
        if (pitchParam <= swingParam) {
            dist += (swingParam - pitchParam);
        } else {
            dist += (pitchParam - swingParam);
        }

        return dist;
    }

    function resolve(Pitch memory pitch, Swing memory swing) public view returns (Outcome) {
        if (swing.kind == SwingType.Take) {
            if (
                pitch.vertical == VerticalLocation.HighBall || pitch.vertical == VerticalLocation.LowBall
                    || pitch.horizontal == HorizontalLocation.InsideBall
                    || pitch.horizontal == HorizontalLocation.OutsideBall
            ) {
                return Outcome.Walk;
            } else {
                return Outcome.Strikeout;
            }
        }

        uint256 dist = _l1_distance(pitch, swing);
        if (dist == 0) {
            return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, Distance0Distribution);
        } else if (dist == 1) {
            return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, Distance1Distribution);
        } else if (dist == 2) {
            return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, Distance2Distribution);
        }

        return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, DistanceGT2Distribution);
    }

    function revealPitch(
        uint256 sessionID,
        uint256 nonce,
        PitchSpeed speed,
        VerticalLocation vertical,
        HorizontalLocation horizontal
    )
        external
    {
        uint256 progress = _sessionProgress(sessionID);
        if (progress == 6) {
            revert("Fullcount.revealPitch: session has expired");
        }
        require(progress == 4, "Fullcount.revealPitch: cannot reveal in current state");

        Session storage session = SessionState[sessionID];

        require(
            msg.sender == Staker[session.pitcherAddress][session.pitcherTokenID],
            "Fullcount.revealPitch: msg.sender did not stake pitcher"
        );

        require(!session.didPitcherReveal, "Fullcount.revealPitch: pitcher already revealed");

        bytes32 pitchMessageHash = pitchHash(nonce, speed, vertical, horizontal);
        require(
            SignatureChecker.isValidSignatureNow(msg.sender, pitchMessageHash, session.pitcherCommit),
            "Fullcount.revealPitch: invalid signature"
        );

        session.didPitcherReveal = true;
        session.pitcherReveal = Pitch(nonce, speed, vertical, horizontal);

        emit PitchRevealed(sessionID, session.pitcherReveal);

        if (session.didBatterReveal) {
            Outcome outcome = resolve(session.pitcherReveal, session.batterReveal);
            emit SessionResolved(
                sessionID,
                outcome,
                session.pitcherAddress,
                session.pitcherTokenID,
                session.batterAddress,
                session.batterTokenID
            );

            session.outcome = outcome;

            _unstakeNFT(session.pitcherAddress, session.pitcherTokenID);
        }
    }

    function revealSwing(
        uint256 sessionID,
        uint256 nonce,
        SwingType kind,
        VerticalLocation vertical,
        HorizontalLocation horizontal
    )
        external
    {
        uint256 progress = _sessionProgress(sessionID);
        if (progress == 6) {
            revert("Fullcount.revealSwing: session has expired");
        }
        require(progress == 4, "Fullcount.revealSwing: cannot reveal in current state");

        Session storage session = SessionState[sessionID];

        require(
            msg.sender == Staker[session.batterAddress][session.batterTokenID],
            "Fullcount.revealSwing: msg.sender did not stake batter"
        );

        require(!session.didBatterReveal, "Fullcount.revealSwing: batter already revealed");

        bytes32 swingMessageHash = swingHash(nonce, kind, vertical, horizontal);
        require(
            SignatureChecker.isValidSignatureNow(msg.sender, swingMessageHash, session.batterCommit),
            "Fullcount.revealSwing: invalid signature"
        );

        session.didBatterReveal = true;
        session.batterReveal = Swing(nonce, kind, vertical, horizontal);

        emit SwingRevealed(sessionID, session.batterReveal);

        if (session.didPitcherReveal) {
            Outcome outcome = resolve(session.pitcherReveal, session.batterReveal);
            emit SessionResolved(
                sessionID,
                outcome,
                session.pitcherAddress,
                session.pitcherTokenID,
                session.batterAddress,
                session.batterTokenID
            );

            session.outcome = outcome;

            _unstakeNFT(session.batterAddress, session.batterTokenID);
        }
    }
}
