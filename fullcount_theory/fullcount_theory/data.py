"""
The comments above the enums refer back to data.sol
"""

from enum import Enum

"""
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
"""
class Outcome(Enum):
    Strikeout = 0
    Walk = 1
    Single = 2
    Double = 3
    Triple = 4
    HomeRun = 5
    GroundOut = 6
    FlyOut = 7

"""
/*
Pitch types:
- Fastball - 0
- Curveball - 1
- Changeup - 2
*/
"""
class PitchType(Enum):
    Fastball = 0
    Curveball = 1
    Changeup = 2

"""
/*
Types of swings a batter can make:
- Contact - 0
- Power - 1
- Check - 2
"""
class SwingType(Enum):
    Contact = 0
    Power = 1
    Check = 2

"""
/*
Possible vertical locations for a pitch:
- HighBall - 0
- HighStrike - 1
- Middle - 2
- LowStrike - 3
- LowBall - 4
*/
"""
class VerticalLocation(Enum):
    HighBall = 0
    HighStrike = 1
    Middle = 2
    LowStrike = 3
    LowBall = 4

"""
/*
Possible horizontal locations for a pitch:
- InsideBall - 0
- InsideStrike - 1
- Middle - 2
- OutsideStrike - 3
- OutsideBall - 4
*/
"""
class HorizontalLocation(Enum):
    InsideBall = 0
    InsideStrike = 1
    Middle = 2
    OutsideStrike = 3
    OutsideBall = 4
