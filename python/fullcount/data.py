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
    """

    Strike = 0
    Ball = 1
    Foul = 2
    Single = 3
    Double = 4
    Triple = 5
    HomeRun = 6
    InPlayOut = 7


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
        + 2 * abs(pitch_vertical_location.value -
                  swing_vertical_location.value)
        + abs(pitch_type.value - swing_type.value)
    )


def sample(distribution: OutcomeDistribution) -> Outcome:
    roll = random.randint(0, 9999)
    outcome_index = min(i for i in range(
        8) if sum(distribution[: i + 1]) > roll)
    return Outcome(outcome_index)


def configure_move_type_handler(
    parser: argparse.ArgumentParser, required: bool = True
) -> None:
    parser.add_argument("--pitch-type", "-t", type=int, required=required)
    parser.add_argument("--pitch-vertical", "-v", type=int, required=required)
    parser.add_argument("--pitch-horizontal", "-z",
                        type=int, required=required)
    parser.add_argument("--swing-type", "-T", type=int, required=required)
    parser.add_argument("--swing-vertical", "-V", type=int, required=required)
    parser.add_argument("--swing-horizontal", "-Z",
                        type=int, required=required)
