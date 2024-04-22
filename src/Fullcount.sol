// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.19;

import { EIP712 } from "../lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";
import { IERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import { SignatureChecker } from "../lib/openzeppelin-contracts/contracts/utils/cryptography/SignatureChecker.sol";

import {
    AtBat,
    AtBatOutcome,
    HorizontalLocation,
    NFT,
    Outcome,
    Pitch,
    PitchSpeed,
    PlayerType,
    Session,
    Swing,
    SwingType,
    VerticalLocation
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
contract Fullcount is EIP712 {
    string public constant FullcountVersion = "0.1.1";

    uint256 public SecondsPerPhase;

    uint256 public NumSessions;

    // We want to strongly reward distance 0 swings.
    // 10% chance of single, 25% chance of double, 15% chance of triple, 60% chance of home run
    uint256[8] public Distance0Distribution = [0, 0, 0, 0, 2500, 1500, 6000, 0];
    // Distance 1 swings should also be mostly postive outcomes and have no negative outsomes (for batter)
    // but considerably lower chances at big hits.
    // 25% chamce of foul, 25% chance of single, 25% chance of double, 5% chance of triple, 20% chance of home run
    uint256[8] public Distance1Distribution = [0, 0, 2500, 2500, 2500, 500, 2000, 0];
    // Distance 2 swings should be half hits (mostly weaker) with some neutral and few negative outcomes
    // 40% chance of foul, 37% chance of single, 14% chance of double, 2% chance of triple, 7% chance of home run
    uint256[8] public Distance2Distribution = [0, 0, 4000, 3700, 1400, 200, 700, 0];
    // Distance 3 swings should be mostly negative outcomes and little chance of big hits
    // 32% chance of strike, 45% chance of foul, 15% chance of single, 5% chance of double, 3% chance of out
    uint256[8] public Distance3Distribution = [3200, 0, 4500, 1500, 500, 0, 0, 300];
    // Distance 4 swings should be mostly strikes and have no positive outcomes (for batter)
    // 71% chance of strike, 21% chance of foul, 9% chance of out
    uint256[8] public Distance4Distribution = [7100, 0, 2000, 0, 0, 0, 0, 900];
    // Distance 5+ swings should all be strikes
    uint256[8] public DistanceGT4Distribution = [10_000, 0, 0, 0, 0, 0, 0, 0];

    // Session ID => session state
    // NOTE: Sessions are 1-indexed
    mapping(uint256 => Session) public SessionState;
    mapping(uint256 => bool) public SessionRequiresSignature;

    // ERC721 address => ERC721 token ID => session that that character is staked into
    // NOTE: Sessions are 1-indexed
    mapping(address => mapping(uint256 => uint256)) public StakedSession;

    uint256 public NumAtBats;
    mapping(uint256 => AtBat) public AtBatState;
    mapping(uint256 => uint256[]) public AtBatSessions;
    mapping(uint256 => uint256) public SessionAtBat;

    // Player address => executor address => bool. Whether or not the
    // executor is able to submit at-bats on behalf of the player.
    mapping(address => mapping(address => bool)) public TrustedExecutors;

    event FullcountDeployed(string indexed version, uint256 SecondsPerPhase);

    event ExecutorChange(address indexed player, address indexed executor, bool approved);

    event SessionStarted(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionJoined(
        uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID, PlayerType role
    );
    event SessionExited(uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID);
    event SessionAborted(uint256 indexed sessionID, address indexed nftAddress, uint256 indexed tokenID);
    event SessionResolved(
        uint256 indexed sessionID,
        Outcome indexed outcome,
        address pitcherAddress,
        uint256 pitcherTokenID,
        address batterAddress,
        uint256 batterTokenID
    );

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

    event PitchCommitted(uint256 indexed sessionID);
    event SwingCommitted(uint256 indexed sessionID);
    event PitchRevealed(uint256 indexed sessionID, Pitch pitch);
    event SwingRevealed(uint256 indexed sessionID, Swing swing);

    constructor(uint256 secondsPerPhase) EIP712("Fullcount", FullcountVersion) {
        SecondsPerPhase = secondsPerPhase;
        emit FullcountDeployed(FullcountVersion, secondsPerPhase);
    }

    // This is useful because of how return values from the public mapping get serialized.
    function getSession(uint256 sessionID) external view returns (Session memory) {
        return SessionState[sessionID];
    }

    function getAtBat(uint256 atBatID) external view returns (AtBat memory) {
        return AtBatState[atBatID];
    }

    function getNumberOfSessionsInAtBat(uint256 atBatID) external view returns (uint256) {
        return AtBatSessions[atBatID].length;
    }

    function _isExecutorForPlayer(address executor, address player) internal view returns (bool) {
        return TrustedExecutors[player][executor];
    }

    function isExecutorForPlayer(address executor, address player) external view returns (bool) {
        return _isExecutorForPlayer(executor, player);
    }

    function setTrustedExecutor(address executor, bool approved) external virtual {
        TrustedExecutors[msg.sender][executor] = approved;
        emit ExecutorChange(msg.sender, executor, approved);
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
        if (sessionID > NumSessions || sessionID == 0) {
            return 0;
        }

        Session storage session = SessionState[sessionID];

        if (session.didPitcherReveal && session.didBatterReveal) {
            return 5;
        } else if (session.phaseStartTimestamp > 0 && session.phaseStartTimestamp + SecondsPerPhase < block.timestamp) {
            return 6;
        } else if (session.pitcherNFT.nftAddress == address(0) || session.batterNFT.nftAddress == address(0)) {
            if (session.pitcherLeftSession || session.batterLeftSession) {
                return 1;
            } else {
                return 2;
            }
        } else if (!session.didPitcherCommit || !session.didBatterCommit) {
            return 3;
        } else if (!session.didPitcherReveal || !session.didBatterReveal) {
            return 4;
        }

        revert("Fullcount._sessionProgress: idiot programmer");
    }

    function sessionProgress(uint256 sessionID) public view returns (uint256) {
        return _sessionProgress(sessionID);
    }

    function sessionHash(uint256 sessionID) public view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(keccak256("SessionMessage(uint256 sessionID)"), uint256(sessionID)));
        return _hashTypedDataV4(structHash);
    }

    function _isTokenOwner(address nftAddress, uint256 tokenID) internal view returns (bool) {
        return msg.sender == IERC721(nftAddress).ownerOf(tokenID);
    }

    // Emits:
    // - SessionStarted
    function _startSession(
        address nftAddress,
        uint256 tokenID,
        PlayerType role,
        bool requireSignature
    )
        internal
        returns (uint256)
    {
        require(StakedSession[nftAddress][tokenID] == 0, "Fullcount._startSession: NFT is already staked to a session.");

        // Increment NumSessions. The new value is the ID of the session that was just started.
        // This is what makes sessions 1-indexed.
        NumSessions++;

        if (role == PlayerType.Pitcher) {
            SessionState[NumSessions].pitcherNFT.nftAddress = nftAddress;
            SessionState[NumSessions].pitcherNFT.tokenID = tokenID;
        } else {
            SessionState[NumSessions].batterNFT.nftAddress = nftAddress;
            SessionState[NumSessions].batterNFT.tokenID = tokenID;
        }

        StakedSession[nftAddress][tokenID] = NumSessions;

        // SessionState[NumSessions].phaseStartTimestamp = block.timestamp;

        SessionRequiresSignature[NumSessions] = requireSignature;

        emit SessionStarted(NumSessions, nftAddress, tokenID, role);

        return NumSessions;
    }

    function startSession(
        address nftAddress,
        uint256 tokenID,
        PlayerType role,
        bool requireSignature
    )
        external
        virtual
        returns (uint256)
    {
        require(_isTokenOwner(nftAddress, tokenID), "Fullcount.startSession: msg.sender is not NFT owner");

        uint256 sessionID = _startSession(nftAddress, tokenID, role, requireSignature);

        return sessionID;
    }

    function _joinSession(uint256 sessionID, address nftAddress, uint256 tokenID) internal {
        require(sessionID <= NumSessions, "Fullcount._joinSession: session does not exist");

        require(StakedSession[nftAddress][tokenID] == 0, "Fullcount.joinSession: NFT is already staked to a session.");

        Session storage session = SessionState[sessionID];

        if (session.pitcherNFT.nftAddress != address(0) && session.batterNFT.nftAddress != address(0)) {
            revert("Fullcount._joinSession: session is already full");
        } else if (session.pitcherLeftSession || session.batterLeftSession) {
            revert("Fullcount._joinSession: opponent left session");
        }

        PlayerType role = PlayerType.Pitcher;
        if (session.batterNFT.nftAddress == address(0)) {
            role = PlayerType.Batter;
            session.batterNFT.nftAddress = nftAddress;
            session.batterNFT.tokenID = tokenID;
        } else {
            session.pitcherNFT.nftAddress = nftAddress;
            session.pitcherNFT.tokenID = tokenID;
        }

        session.phaseStartTimestamp = block.timestamp;

        StakedSession[nftAddress][tokenID] = sessionID;

        emit SessionJoined(sessionID, nftAddress, tokenID, role);
    }

    function _joinAtBat(uint256 atBatID, address nftAddress, uint256 tokenID, uint256 firstSessionID) internal {
        AtBat storage atBat = AtBatState[atBatID];

        PlayerType role = PlayerType.Pitcher;
        if (atBat.batterNFT.nftAddress == address(0)) {
            role = PlayerType.Batter;
            atBat.batterNFT.nftAddress = nftAddress;
            atBat.batterNFT.tokenID = tokenID;
        } else {
            atBat.pitcherNFT.nftAddress = nftAddress;
            atBat.pitcherNFT.tokenID = tokenID;
        }

        emit AtBatJoined(atBatID, nftAddress, tokenID, firstSessionID, role);
    }

    // Emits:
    // - SessionJoined
    function joinSession(
        uint256 sessionID,
        address nftAddress,
        uint256 tokenID,
        bytes memory signature
    )
        external
        virtual
    {
        require(sessionID <= NumSessions, "Fullcount.joinSession: session does not exist");

        require(_isTokenOwner(nftAddress, tokenID), "Fullcount.joinSession: msg.sender is not NFT owner");

        Session storage session = SessionState[sessionID];

        if (SessionRequiresSignature[sessionID]) {
            address sessionStarter;
            if (session.pitcherNFT.nftAddress != address(0)) {
                sessionStarter = IERC721(session.pitcherNFT.nftAddress).ownerOf(session.pitcherNFT.tokenID);
            } else if (session.batterNFT.nftAddress != address(0)) {
                sessionStarter = IERC721(session.batterNFT.nftAddress).ownerOf(session.batterNFT.tokenID);
            } else {
                revert("Fullcount.joinSession: idiot programmer");
            }

            bytes32 sessionMessageHash = sessionHash(sessionID);
            require(
                SignatureChecker.isValidSignatureNow(sessionStarter, sessionMessageHash, signature),
                "Fullcount.joinSession: invalid signature in session requiring signature to join."
            );
        }

        _joinSession(sessionID, nftAddress, tokenID);

        uint256 atBatID = SessionAtBat[sessionID];
        if (atBatID > 0) {
            _joinAtBat(atBatID, nftAddress, tokenID, sessionID);
        }
    }

    function startAtBat(
        address nftAddress,
        uint256 tokenID,
        PlayerType role,
        bool requireSignature
    )
        external
        virtual
        returns (uint256)
    {
        require(_isTokenOwner(nftAddress, tokenID), "Fullcount.startSession: msg.sender is not NFT owner");

        NumAtBats++;

        if (role == PlayerType.Pitcher) {
            AtBatState[NumAtBats].pitcherNFT.nftAddress = nftAddress;
            AtBatState[NumAtBats].pitcherNFT.tokenID = tokenID;
        } else {
            AtBatState[NumAtBats].batterNFT.nftAddress = nftAddress;
            AtBatState[NumAtBats].batterNFT.tokenID = tokenID;
        }

        uint256 firstSessionID = _startSession(nftAddress, tokenID, role, requireSignature);
        AtBatSessions[NumAtBats] = [firstSessionID];
        SessionAtBat[firstSessionID] = NumAtBats;

        emit AtBatStarted(NumAtBats, nftAddress, tokenID, firstSessionID, role, requireSignature);

        return NumAtBats;
    }

    function _progressAtBat(uint256 finishedSessionID, bool updateStakedTokens) internal {
        uint256 atBatID = SessionAtBat[finishedSessionID];
        if (atBatID == 0) return;

        Session storage finishedSession = SessionState[finishedSessionID];

        AtBat storage atBat = AtBatState[atBatID];

        if (finishedSession.outcome == Outcome.Strike) {
            if (atBat.strikes >= 2) {
                atBat.outcome = AtBatOutcome.Strikeout;
            } else {
                atBat.strikes++;
                if (updateStakedTokens) {
                    _startNextAtBatSession(
                        atBatID,
                        finishedSession.pitcherNFT.nftAddress,
                        finishedSession.pitcherNFT.tokenID,
                        finishedSession.batterNFT.nftAddress,
                        finishedSession.batterNFT.tokenID
                    );
                }
            }
        } else if (finishedSession.outcome == Outcome.Ball) {
            if (atBat.balls >= 3) {
                atBat.outcome = AtBatOutcome.Walk;
            } else {
                atBat.balls++;
                if (updateStakedTokens) {
                    _startNextAtBatSession(
                        atBatID,
                        finishedSession.pitcherNFT.nftAddress,
                        finishedSession.pitcherNFT.tokenID,
                        finishedSession.batterNFT.nftAddress,
                        finishedSession.batterNFT.tokenID
                    );
                }
            }
        } else if (finishedSession.outcome == Outcome.Foul) {
            if (atBat.strikes < 2) {
                atBat.strikes++;
            }
            if (updateStakedTokens) {
                _startNextAtBatSession(
                    atBatID,
                    finishedSession.pitcherNFT.nftAddress,
                    finishedSession.pitcherNFT.tokenID,
                    finishedSession.batterNFT.nftAddress,
                    finishedSession.batterNFT.tokenID
                );
            }
        } else if (finishedSession.outcome == Outcome.Single) {
            atBat.outcome = AtBatOutcome.Single;
        } else if (finishedSession.outcome == Outcome.Double) {
            atBat.outcome = AtBatOutcome.Double;
        } else if (finishedSession.outcome == Outcome.Triple) {
            atBat.outcome = AtBatOutcome.Triple;
        } else if (finishedSession.outcome == Outcome.HomeRun) {
            atBat.outcome = AtBatOutcome.HomeRun;
        } else if (finishedSession.outcome == Outcome.InPlayOut) {
            atBat.outcome = AtBatOutcome.InPlayOut;
        }

        emit AtBatProgress(
            atBatID,
            atBat.outcome,
            atBat.balls,
            atBat.strikes,
            atBat.pitcherNFT.nftAddress,
            atBat.pitcherNFT.tokenID,
            atBat.batterNFT.nftAddress,
            atBat.batterNFT.tokenID
        );
    }

    function _startNextAtBatSession(
        uint256 atBatID,
        address pitcherNFTAddress,
        uint256 pitcherTokenID,
        address batterNFTAddress,
        uint256 batterTokenID
    )
        internal
    {
        uint256 nextSessionID = _startSession(pitcherNFTAddress, pitcherTokenID, PlayerType.Pitcher, false);
        _joinSession(nextSessionID, batterNFTAddress, batterTokenID);

        uint256[] storage sessionList = AtBatSessions[atBatID];
        sessionList.push(nextSessionID);
        SessionAtBat[nextSessionID] = atBatID;
    }

    // TODO change name of function as tokens are no longer staked?
    function _unstakeNFT(address nftAddress, uint256 tokenID) internal {
        require(_isTokenOwner(nftAddress, tokenID), "Fullcount._unstakeNFT: msg.sender is not NFT owner");

        uint256 stakedSessionID = StakedSession[nftAddress][tokenID];
        require(stakedSessionID > 0, "Fullcount._unstakeNFT: NFT is not staked");

        if (
            SessionState[stakedSessionID].pitcherNFT.nftAddress == nftAddress
                && SessionState[stakedSessionID].pitcherNFT.tokenID == tokenID
        ) {
            SessionState[stakedSessionID].pitcherLeftSession = true;
        } else if (
            SessionState[stakedSessionID].batterNFT.nftAddress == nftAddress
                && SessionState[stakedSessionID].batterNFT.tokenID == tokenID
        ) {
            SessionState[stakedSessionID].batterLeftSession = true;
        } else {
            revert("Fullcount._unstakeNFT: idiot programmer");
        }

        StakedSession[nftAddress][tokenID] = 0;
    }

    function unstakeNFT(address nftAddress, uint256 tokenID) external {
        uint256 progress = _sessionProgress(StakedSession[nftAddress][tokenID]);
        require(
            progress == 2 || progress == 5 || progress == 6,
            "Fullcount.unstakeNFT: cannot unstake from session in this state"
        );

        _unstakeNFT(nftAddress, tokenID);
    }

    /**
     * Players who have started a session but who have not yet had an opponent join their session can choose
     * to abort the session and unstake their characters.
     */
    function abortSession(uint256 sessionID) external {
        require(_sessionProgress(sessionID) == 2, "Fullcount.abortSession: cannot abort from session in this state");

        // In each branch, we emit SessionAborted before unstaking because unstaking changes SessionState.
        if (SessionState[sessionID].pitcherNFT.nftAddress != address(0)) {
            emit SessionAborted(
                sessionID, SessionState[sessionID].pitcherNFT.nftAddress, SessionState[sessionID].pitcherNFT.tokenID
            );
            _unstakeNFT(SessionState[sessionID].pitcherNFT.nftAddress, SessionState[sessionID].pitcherNFT.tokenID);
        } else if (SessionState[sessionID].batterNFT.nftAddress != address(0)) {
            emit SessionAborted(
                sessionID, SessionState[sessionID].batterNFT.nftAddress, SessionState[sessionID].batterNFT.tokenID
            );
            _unstakeNFT(SessionState[sessionID].batterNFT.nftAddress, SessionState[sessionID].batterNFT.tokenID);
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
            _isTokenOwner(session.pitcherNFT.nftAddress, session.pitcherNFT.tokenID),
            "Fullcount.commitPitch: msg.sender is not pitcher NFT owner"
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
            _isTokenOwner(session.batterNFT.nftAddress, session.batterNFT.tokenID),
            "Fullcount.commitSwing: msg.sender is not batter NFT owner"
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
        uint256[8] memory distribution
    )
        public
        pure
        returns (Outcome)
    {
        uint256 totalMass = distribution[0] + distribution[1] + distribution[2] + distribution[3] + distribution[4]
            + distribution[5] + distribution[6] + distribution[7];

        uint256 sample = _randomSample(nonce0, nonce1, totalMass);

        uint256 cumulativeMass = distribution[0];
        if (sample < cumulativeMass) {
            return Outcome.Strike;
        }

        cumulativeMass += distribution[1];
        if (sample < cumulativeMass) {
            return Outcome.Ball;
        }

        cumulativeMass += distribution[2];
        if (sample < cumulativeMass) {
            return Outcome.Foul;
        }

        cumulativeMass += distribution[3];
        if (sample < cumulativeMass) {
            return Outcome.Single;
        }

        cumulativeMass += distribution[4];
        if (sample < cumulativeMass) {
            return Outcome.Double;
        }

        cumulativeMass += distribution[5];
        if (sample < cumulativeMass) {
            return Outcome.Triple;
        }

        cumulativeMass += distribution[6];
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
            dist += 2 * (swingParam - pitchParam);
        } else {
            dist += 2 * (pitchParam - swingParam);
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
                return Outcome.Ball;
            } else {
                return Outcome.Strike;
            }
        }

        uint256 dist = _l1_distance(pitch, swing);
        if (dist == 0) {
            return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, Distance0Distribution);
        } else if (dist == 1) {
            return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, Distance1Distribution);
        } else if (dist == 2) {
            return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, Distance2Distribution);
        } else if (dist == 3) {
            return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, Distance3Distribution);
        } else if (dist == 4) {
            return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, Distance4Distribution);
        }

        return sampleOutcomeFromDistribution(pitch.nonce, swing.nonce, DistanceGT4Distribution);
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
            _isTokenOwner(session.pitcherNFT.nftAddress, session.pitcherNFT.tokenID),
            "Fullcount.revealPitch: msg.sender is not pitcher NFT owner"
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
                session.pitcherNFT.nftAddress,
                session.pitcherNFT.tokenID,
                session.batterNFT.nftAddress,
                session.batterNFT.tokenID
            );

            session.outcome = outcome;

            StakedSession[session.batterNFT.nftAddress][session.batterNFT.tokenID] = 0;
            session.batterLeftSession = true;
            StakedSession[session.pitcherNFT.nftAddress][session.pitcherNFT.tokenID] = 0;
            session.pitcherLeftSession = true;

            _progressAtBat(sessionID, true);
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
            _isTokenOwner(session.batterNFT.nftAddress, session.batterNFT.tokenID),
            "Fullcount.revealSwing: msg.sender is not batter NFT owner"
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
                session.pitcherNFT.nftAddress,
                session.pitcherNFT.tokenID,
                session.batterNFT.nftAddress,
                session.batterNFT.tokenID
            );

            session.outcome = outcome;

            StakedSession[session.batterNFT.nftAddress][session.batterNFT.tokenID] = 0;
            session.batterLeftSession = true;
            StakedSession[session.pitcherNFT.nftAddress][session.pitcherNFT.tokenID] = 0;
            session.pitcherLeftSession = true;

            _progressAtBat(sessionID, true);
        }
    }

    function submitAtBat(
        NFT memory pitcherNFT,
        NFT memory batterNFT,
        Pitch[] memory pitches,
        Swing[] memory swings,
        AtBatOutcome proposedOutcome
    )
        external
    {
        require(
            pitches.length == swings.length, "Fullcount.submitAtBat: number of pitches does not match number of swings."
        );

        address pitcherOwner = IERC721(pitcherNFT.nftAddress).ownerOf(pitcherNFT.tokenID);
        require(
            _isExecutorForPlayer(msg.sender, pitcherOwner),
            "Fullcount.submitAtBat: sender is not an executor for pitcher."
        );

        address batterOwner = IERC721(batterNFT.nftAddress).ownerOf(batterNFT.tokenID);
        require(
            _isExecutorForPlayer(msg.sender, batterOwner),
            "Fullcount.submitAtBat: sender is not an executor for batter."
        );

        // Create at-bat
        NumAtBats++;

        AtBatState[NumAtBats].pitcherNFT = pitcherNFT;
        AtBatState[NumAtBats].batterNFT = batterNFT;

        uint256[] storage sessionList = AtBatSessions[NumAtBats];

        for (uint256 i = 0; i < pitches.length; i++) {
            if (AtBatState[NumAtBats].outcome != AtBatOutcome.InProgress) {
                revert("Fullcount.submitAtBat: invalid at-bat - invalid at-bat");
            }

            Outcome sessionOutcome = resolve(pitches[i], swings[i]);

            NumSessions++;
            SessionState[NumSessions].pitcherNFT = pitcherNFT;
            SessionState[NumSessions].batterNFT = batterNFT;
            SessionState[NumSessions].outcome = sessionOutcome;

            emit SessionResolved(
                NumSessions,
                sessionOutcome,
                pitcherNFT.nftAddress,
                pitcherNFT.tokenID,
                batterNFT.nftAddress,
                batterNFT.tokenID
            );

            // Add session to at-bat
            sessionList.push(NumSessions);
            SessionAtBat[NumSessions] = NumAtBats;

            _progressAtBat(NumSessions, false);
        }

        if (AtBatState[NumAtBats].outcome == AtBatOutcome.InProgress) {
            revert("Fullcount.submitAtBat: invalid at-bat - inconclusive");
        }

        if (AtBatState[NumAtBats].outcome != proposedOutcome) {
            revert("Fullcount.submitAtBat: at-bat outcome does not match executor proposed outcome");
        }
    }
}
