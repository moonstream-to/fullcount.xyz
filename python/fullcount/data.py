"""
The docstrings for the enums refer back to data.sol
"""

import argparse
from enum import Enum
import random
from typing import Callable, Tuple

MAX_UINT256 = 2**256 - 1


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
    * - InPlayOut - 6
    */
    """

    Strikeout = 0
    Walk = 1
    Single = 2
    Double = 3
    Triple = 4
    HomeRun = 5
    InPlayOut = 6


class PitchType(Enum):
    """
    /*
    Pitch types:
    - Fast - 0
    - Slow - 1
    */
    """

    Fast = 0
    Slow = 1


class SwingType(Enum):
    """
    /*
    Types of swings a batter can make:
    - Contact - 0
    - Power - 1
    - Take - 2
    """

    Contact = 0
    Power = 1
    Take = 2


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


def l1_distance(
    pitch_type: PitchType,
    pitch_vertical_location: VerticalLocation,
    pitch_horizontal_location: HorizontalLocation,
    swing_type: SwingType,
    swing_vertical_location: VerticalLocation,
    swing_horizontal_location: HorizontalLocation,
) -> int:
    assert swing_type != SwingType.Take, "Distance not used when batter chooses Take"
    return (
        abs(pitch_horizontal_location.value - swing_horizontal_location.value)
        + abs(pitch_vertical_location.value - swing_vertical_location.value)
        + abs(pitch_type.value - swing_type.value)
    )


def sample(distribution: OutcomeDistribution) -> Outcome:
    roll = random.randint(0, 9999)
    outcome_index = min(i for i in range(8) if sum(distribution[: i + 1]) > roll)
    return Outcome(outcome_index)


def configure_move_type_handler(
    parser: argparse.ArgumentParser, required: bool = True
) -> None:
    parser.add_argument("--pitch-type", "-t", type=int, required=required)
    parser.add_argument("--pitch-vertical", "-v", type=int, required=required)
    parser.add_argument("--pitch-horizontal", "-z", type=int, required=required)
    parser.add_argument("--swing-type", "-T", type=int, required=required)
    parser.add_argument("--swing-vertical", "-V", type=int, required=required)
    parser.add_argument("--swing-horizontal", "-Z", type=int, required=required)
