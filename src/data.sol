// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.19;

/*
This file defines the basic data types and structures that are used in Fullcount game mechanics.
*/

/*
Player types:
- Pitcher - 0
- Batther - 1
*/
enum PlayerType {
    Pitcher,
    Batter
}

/*
Pitch speeds:
- Fast - 0
- Slow - 1
*/
enum PitchSpeed {
    Fast,
    Slow
}

/*
Types of swings a batter can make:
- Contact - 0
- Power - 1
- Take - 2

No bunting in a bottom-of-the-ninth situation with 2 outs and the bases loaded in a full count.
*/
enum SwingType {
    Contact,
    Power,
    Take
}

/*
Possible vertical locations for a pitch:
- HighBall - 0
- HighStrike - 1
- Middle - 2
- LowStrike - 3
- LowBall - 4
*/
enum VerticalLocation {
    HighBall,
    HighStrike,
    Middle,
    LowStrike,
    LowBall
}

/*
Possible horizontal locations for a pitch:
- InsideBall - 0
- InsideStrike - 1
- Middle - 2
- OutsideStrike - 3
- OutsideBall - 4
*/
enum HorizontalLocation {
    InsideBall,
    InsideStrike,
    Middle,
    OutsideStrike,
    OutsideBall
}

/**
 * Possible outcomes of a Fullcount session:
 * - Strikeout - 0
 * - Walk - 1
 * - Single - 2
 * - Double - 3
 * - Triple - 4
 * - HomeRun - 5
 * - InPlayOut - 6
 *
 * InPlayOut represents a GroundOut or FlyOut. In the future, we may split this into two outcomes.
 */
enum Outcome {
    Strikeout,
    Walk,
    Single,
    Double,
    Triple,
    HomeRun,
    InPlayOut
}

/*
Pitch represents the pitcher's move in a Fullcount session.
*/
struct Pitch {
    uint256 nonce;
    PitchSpeed speed;
    VerticalLocation vertical;
    HorizontalLocation horizontal;
}

/*
Swing represents the batter's move in a Fullcount session.
*/
struct Swing {
    uint256 nonce;
    SwingType kind;
    VerticalLocation vertical;
    HorizontalLocation horizontal;
}

struct NFT {
    address nftAddress;
    uint256 tokenID;
}

struct PlayerInfo {
    NFT nft;
    bool didCommit;
    bytes commitment;
    bool didReveal;
    bool leftSession;
}

/*
Session represents the state of a Fullcount session.
*/
struct Session {
    uint256 phaseStartTimestamp;
    PlayerInfo pitcher;
    PlayerInfo batter;
    Pitch pitcherReveal;
    Swing batterReveal;
    Outcome outcome;
    bool requireSignature;
    address sessionStarter;
}
