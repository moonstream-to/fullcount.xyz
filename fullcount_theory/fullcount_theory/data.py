"""
The docstrings for the enums refer back to data.sol
"""

from enum import Enum
from typing import Callable, Tuple


class Outcome(Enum):
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

    Strikeout = 0
    Walk = 1
    Single = 2
    Double = 3
    Triple = 4
    HomeRun = 5
    GroundOut = 6
    FlyOut = 7


class PitchType(Enum):
    """
    /*
    Pitch types:
    - Fastball - 0
    - Curveball - 1
    - Changeup - 2
    */
    """

    Fastball = 0
    Curveball = 1
    Changeup = 2


class SwingType(Enum):
    """
    /*
    Types of swings a batter can make:
    - Contact - 0
    - Power - 1
    - Check - 2
    """

    Contact = 0
    Power = 1
    Check = 2


class VerticalLocation(Enum):
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

    HighBall = 0
    HighStrike = 1
    Middle = 2
    LowStrike = 3
    LowBall = 4


class HorizontalLocation(Enum):
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

    InsideBall = 0
    InsideStrike = 1
    Middle = 2
    OutsideStrike = 3
    OutsideBall = 4


# Ideally, these ints add up to 10,000. The tuple represents a probability distribution over the 8 possible outcomes.
# The int values in the tuple are to be interpreted as basis points (0.01%).
OutcomeDistribution = Tuple[int, int, int, int, int, int, int, int]

Rule = Callable[
    [
        PitchType,
        VerticalLocation,
        HorizontalLocation,
        SwingType,
        VerticalLocation,
        HorizontalLocation,
    ],
    OutcomeDistribution,
]
