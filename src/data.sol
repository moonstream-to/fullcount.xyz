// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.19;

/*
This file defines the basic data types and structures that are used in Lightning and Smoke game mechanics.
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
    Changeup,
    Knuckleball
}

/*
Types of swings a batter can make:
- Contact - 0
- Power - 1
- Bunt - 2
- Check - 3
*/
enum SwingType {
    Contact,
    Power,
    Bunt,
    Soft
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

/*
Pitch represents the pitcher's move in a Lightning and Smoke session.
*/
struct Pitch {
    uint256 nonce;
    PitchType kind;
    VerticalLocation vertical;
    HorizontalLocation horizontal;
}

/*
Swing represents the batter's move in a Lightning and Smoke session.
*/
struct Swing {
    uint256 nonce;
    SwingType kind;
    VerticalLocation vertical;
    HorizontalLocation horizontal;
}

/*
Session represents the state of a Lightning and Smoke session.
*/
struct Session {
    uint256 phaseStartBlock;
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
