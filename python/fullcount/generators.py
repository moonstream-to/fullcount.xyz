"""
Code generators.

Can generate:
1. outcome_tests: Generates Forge tests to test the resolution of the outcome of a Fullcount game.
   Each call generates up to three tests - two which test the boundary conditions for that outcome and
   one which tests the interior. If the interior condition is equal to one of the boundary conditions,
   two tests are generated.
"""

import argparse
import random
from typing import Optional

from .data import (
    l1_distance,
    Outcome,
    OutcomeDistribution,
    PitchType,
    SwingType,
    VerticalLocation,
    HorizontalLocation,
    MAX_UINT256,
)
from .generation_1 import Distance0, Distance1, Distance2, DistanceGT2
from .randomness import grind

OUTCOME_TEST_TEMPLATE = """
/**
 * To generate boundary and interior condition tests for this test case:
 * $ fullcount codegen outcome-tests --desired-outcome {outcome.value} --pitch-type {pitch_type.value} --pitch-vert {pitch_vert.value} --pitch-hor {pitch_hor.value} --swing-type {swing_type.value} --swing-vert {swing_vert.value} --swing-hor {swing_hor.value}
 */
function test_{pitch_nonce}_{pitch_type.name}_{pitch_vert.name}_{pitch_hor.name}_{swing_nonce}_{swing_type.name}_{swing_vert.name}_{swing_hor.name}_{outcome.name}() public {{
    //  Nonces {pitch_nonce} and {swing_nonce} generate random number {rng} which maps to Outcome.{outcome.name}.

    assertEq(game.sessionProgress(SessionID), 3);

    Pitch memory pitch =
        Pitch({pitch_nonce}, PitchSpeed.{pitch_type.name}, VerticalLocation.{pitch_vert.name}, HorizontalLocation.{pitch_hor.name});

    _commitPitch(SessionID, player1, player1PrivateKey, pitch);

    assertEq(game.sessionProgress(SessionID), 3);

    Swing memory swing = Swing(
        {swing_nonce}, SwingType.{swing_type.name}, VerticalLocation.{swing_vert.name}, HorizontalLocation.{swing_hor.name}
    );

    _commitSwing(SessionID, player2, player2PrivateKey, swing);

    assertEq(game.sessionProgress(SessionID), 4);

    // Pitcher reveals first.
    _revealPitch(SessionID, player1, pitch);

    vm.startPrank(player2);

    vm.expectEmit(address(game));
    emit SessionResolved(
        SessionID,
        Outcome.{outcome.name},
        PitcherNFTAddress,
        PitcherTokenID,
        BatterNFTAddress,
        BatterTokenID
    );

    game.revealSwing(SessionID, swing.nonce, swing.kind, swing.vertical, swing.horizontal);

    vm.stopPrank();

    Session memory session = game.getSession(SessionID);
    assertTrue(session.batter.didReveal);
    assertEq(uint256(session.outcome), uint256(Outcome.{outcome.name}));

    Swing memory sessionSwing = session.batter.didReveal;
    assertEq(sessionSwing.nonce, swing.nonce);
    assertEq(uint256(sessionSwing.kind), uint256(swing.kind));
    assertEq(uint256(sessionSwing.vertical), uint256(swing.vertical));
    assertEq(uint256(sessionSwing.horizontal), uint256(swing.horizontal));

    assertEq(game.sessionProgress(SessionID), 5);
}}
"""


def outcome_tests(
    desired_outcome: Optional[Outcome],
    pitch_type: Optional[PitchType],
    pitch_vert: Optional[VerticalLocation],
    pitch_hor: Optional[HorizontalLocation],
    swing_type: Optional[SwingType],
    swing_vert: Optional[VerticalLocation],
    swing_hor: Optional[HorizontalLocation],
    pitch_nonce: Optional[int],
) -> str:
    if swing_type == SwingType.Take:
        raise ValueError("SwingType.Take currently not supported")

    if desired_outcome is None:
        desired_outcome = random.choice(list(Outcome))

    if pitch_type is None:
        pitch_type = random.choice(list(PitchType))

    if pitch_vert is None:
        pitch_vert = random.choice(list(VerticalLocation))

    if pitch_hor is None:
        pitch_hor = random.choice(list(HorizontalLocation))

    if swing_type is None:
        swing_type = random.choice(
            [item for item in list(SwingType) if item != SwingType.Take]
        )

    if swing_vert is None:
        swing_vert = random.choice(list(VerticalLocation))

    if swing_hor is None:
        swing_hor = random.choice(list(HorizontalLocation))

    distance = l1_distance(
        pitch_type, pitch_vert, pitch_hor, swing_type, swing_vert, swing_hor
    )

    outcome_distribution = DistanceGT2
    if distance == 0:
        outcome_distribution = Distance0
    elif distance == 1:
        outcome_distribution = Distance1
    elif distance == 2:
        outcome_distribution = Distance2

    boundary_0 = sum(outcome_distribution[: desired_outcome.value])
    boundary_1 = sum(outcome_distribution[: desired_outcome.value + 1]) - 1

    rng_to_test = list(
        set([boundary_0, boundary_1, int((boundary_0 + boundary_1) / 2)])
    )

    if pitch_nonce is None:
        pitch_nonce = random.randint(0, MAX_UINT256)

    swing_nonces = [
        grind(pitch_nonce, None, sum(outcome_distribution), rng) for rng in rng_to_test
    ]

    tests = [
        OUTCOME_TEST_TEMPLATE.format(
            outcome=desired_outcome,
            pitch_nonce=pitch_nonce,
            pitch_type=pitch_type,
            pitch_vert=pitch_vert,
            pitch_hor=pitch_hor,
            swing_nonce=swing_nonce,
            swing_type=swing_type,
            swing_vert=swing_vert,
            swing_hor=swing_hor,
            rng=rng,
        )
        for rng, swing_nonce in zip(rng_to_test, swing_nonces)
    ]

    return "\n\n".join(tests)


def handle_outcome_tests(args: argparse.Namespace) -> None:
    print(
        outcome_tests(
            desired_outcome=args.desired_outcome,
            pitch_type=args.pitch_type,
            pitch_vert=args.pitch_vert,
            pitch_hor=args.pitch_hor,
            swing_type=args.swing_type,
            swing_vert=args.swing_vert,
            swing_hor=args.swing_hor,
            pitch_nonce=None,
        )
    )


def generate_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Fullcount codegen")
    parser.set_defaults(func=lambda _: parser.print_help())

    subparsers = parser.add_subparsers()

    outcome_help = (
        f"Desired outcome. If not specified, generates a random desired outcome. Inputs: "
        + ", ".join(f"{outcome.value} - {outcome.name}" for outcome in list(Outcome))
    )
    pitch_type_help = (
        f"Pitch type. If not specified, generates a random pitch type. Inputs: "
        + ", ".join(
            f"{pitch_type.value} - {pitch_type.name}" for pitch_type in list(PitchType)
        )
    )
    swing_type_help = (
        f"Swing type. If not specified, generates a random swing type. Inputs: "
        + ", ".join(
            f"{swing_type.value} - {swing_type.name}" for swing_type in list(SwingType)
        )
    )
    vert_help = (
        f"Vertical location. If not specified, generates a random vertical location. Inputs: "
        + ", ".join(f"{vert.value} - {vert.name}" for vert in list(VerticalLocation))
    )
    hor_help = (
        f"Horizontal location. If not specified, generates a random horizontal location. Inputs: "
        + ", ".join(f"{hor.value} - {hor.name}" for hor in list(HorizontalLocation))
    )

    outcome_tests_parser = subparsers.add_parser("outcome-tests")
    outcome_tests_parser.add_argument(
        "--desired-outcome",
        "-o",
        type=lambda x: Outcome(int(x)),
        required=False,
        default=None,
        help=outcome_help,
    )
    outcome_tests_parser.add_argument(
        "--pitch-type",
        "-t",
        type=lambda x: PitchType(int(x)),
        required=False,
        default=None,
        help=pitch_type_help,
    )
    outcome_tests_parser.add_argument(
        "--pitch-vert",
        "-v",
        type=lambda x: VerticalLocation(int(x)),
        required=False,
        default=None,
        help=vert_help,
    )
    outcome_tests_parser.add_argument(
        "--pitch-hor",
        "-z",
        type=lambda x: HorizontalLocation(int(x)),
        required=False,
        default=None,
        help=hor_help,
    )
    outcome_tests_parser.add_argument(
        "--swing-type",
        "-s",
        type=SwingType,
        required=False,
        default=None,
        help=swing_type_help,
    )
    outcome_tests_parser.add_argument(
        "--swing-vert",
        "-V",
        type=VerticalLocation,
        required=False,
        default=None,
        help=vert_help,
    )
    outcome_tests_parser.add_argument(
        "--swing-hor",
        "-Z",
        type=HorizontalLocation,
        required=False,
        default=None,
        help=hor_help,
    )
    outcome_tests_parser.set_defaults(func=handle_outcome_tests)

    return parser


if __name__ == "__main__":
    parser = generate_cli()
    args = parser.parse_args()
    args.func(args)
