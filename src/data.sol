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
Pitch types:
- Fastball - 0
- Curveball - 1
- Changeup - 2
- Knuckleball - 3
*/
enum PitchType {
    Fastball,
    Curveball,
    Changeup
}

/*
Types of swings a batter can make:
- Contact - 0
- Power - 1
- Check - 2

No bunting in a bottom-of-the-ninth situation with 2 outs and the bases loaded in a full count.

Check guarantees a walk on a ball, and gives a small chance to hit on a pitch in the strike zone.
*/
enum SwingType {
    Contact,
    Power,
    Check
}

/*
Possible vertical locations for a pitch:
- HighBall - 0
- HighStrike - 1
- Middle - 2
- LowStrike - 3
- LowBall - 4
- Dirt - 5
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
 * - GroundOut - 6
 * - FlyOut - 7
 */
enum Outcome {
    Strikeout,
    Walk,
    Single,
    Double,
    Triple,
    HomeRun,
    GroundOut,
    FlyOut
}

/*
Pitch represents the pitcher's move in a Fullcount session.
*/
struct Pitch {
    uint256 nonce;
    PitchType kind;
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

/*
Session represents the state of a Fullcount session.
*/
struct Session {
    uint256 phaseStartTimestamp;
    address pitcherAddress;
    uint256 pitcherTokenID;
    bool didPitcherCommit;
    bool didPitcherReveal;
    bytes pitcherCommit;
    Pitch pitcherReveal;
    address batterAddress;
    uint256 batterTokenID;
    bool didBatterCommit;
    bool didBatterReveal;
    bytes batterCommit;
    Swing batterReveal;
}
