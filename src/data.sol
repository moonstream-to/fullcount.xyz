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
 * - Strike - 0
 * - Ball - 1
 * - Foul - 2
 * - Single - 3
 * - Double - 4
 * - Triple - 5
 * - HomeRun - 6
 * - InPlayOut - 7
 *
 * InPlayOut represents a GroundOut or FlyOut. In the future, we may split this into two outcomes.
 */
enum Outcome {
    Strike,
    Ball,
    Foul,
    Single,
    Double,
    Triple,
    HomeRun,
    InPlayOut
}

enum AtBatOutcome {
    InProgress,
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

/*
Session represents the state of a Fullcount session.
*/
struct Session {
    uint256 phaseStartTimestamp;
    NFT pitcherNFT;
    bool didPitcherCommit;
    bool didPitcherReveal;
    bytes pitcherCommit;
    Pitch pitcherReveal;
    NFT batterNFT;
    bool didBatterCommit;
    bool didBatterReveal;
    bytes batterCommit;
    Swing batterReveal;
    Outcome outcome;
    bool pitcherLeftSession;
    bool batterLeftSession;
}

struct AtBat {
    NFT pitcherNFT;
    NFT batterNFT;
    uint256 balls;
    uint256 strikes;
    AtBatOutcome outcome;
}
