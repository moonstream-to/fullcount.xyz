import argparse
import random
from typing import Optional, List, Tuple

from . import data

Distance0: data.OutcomeDistribution = (0, 0, 0, 0, 2500, 1500, 6000, 0)

Distance1: data.OutcomeDistribution = (0, 0, 2500, 2500, 2500, 500, 2000, 0)

Distance2: data.OutcomeDistribution = (0, 0, 4000, 3700, 1400, 200, 700, 0)

Distance3: data.OutcomeDistribution = (3200, 0, 4500, 1500, 500, 0, 0, 300)

Distance4: data.OutcomeDistribution = (7100, 0, 2000, 0, 0, 0, 0, 900)

DistanceGT4: data.OutcomeDistribution = (10_000, 0, 0, 0, 0, 0, 0, 0)


def result(
    pitch_type: data.PitchType,
    pitch_vertical: data.VerticalLocation,
    pitch_horizontal: data.HorizontalLocation,
    swing_type: data.SwingType,
    swing_vertical: data.VerticalLocation,
    swing_horizontal: data.HorizontalLocation,
) -> data.Outcome:
    if swing_type == data.SwingType.Take:
        if (
            pitch_vertical == data.VerticalLocation.HighBall
            or pitch_vertical == data.VerticalLocation.LowBall
            or pitch_horizontal == data.HorizontalLocation.OutsideBall
            or pitch_horizontal == data.HorizontalLocation.InsideBall
        ):
            return data.Outcome.Walk
        else:
            return data.Outcome.Strikeout

    distance = data.l1_distance(
        pitch_type,
        pitch_vertical,
        pitch_horizontal,
        swing_type,
        swing_vertical,
        swing_horizontal,
    )

    distribution: data.OutcomeDistribution = Distance0
    if distance == 1:
        distribution = Distance1
    elif distance == 2:
        distribution = Distance2
    elif distance == 3:
        distribution = Distance3
    elif distance == 4:
        distribution = Distance4
    elif distance > 4:
        distribution = DistanceGT4

    return data.sample(distribution)


def rollout(
    num_samples: int,
    pitch_type: Optional[data.PitchType] = None,
    pitch_vertical: Optional[data.VerticalLocation] = None,
    pitch_horizontal: Optional[data.HorizontalLocation] = None,
    swing_type: Optional[data.SwingType] = None,
    swing_vertical: Optional[data.VerticalLocation] = None,
    swing_horizontal: Optional[data.HorizontalLocation] = None,
) -> List[
    Tuple[
        data.PitchType,
        data.VerticalLocation,
        data.HorizontalLocation,
        data.SwingType,
        data.VerticalLocation,
        data.HorizontalLocation,
        data.Outcome,
    ]
]:
    results: List[
        Tuple[
            data.PitchType,
            data.VerticalLocation,
            data.HorizontalLocation,
            data.SwingType,
            data.VerticalLocation,
            data.HorizontalLocation,
            data.Outcome,
        ]
    ] = []

    for _ in range(num_samples):
        sample_pitch_type = (
            pitch_type
            if pitch_type is not None
            else data.PitchType(random.randint(0, 1))
        )
        sample_pitch_vertical = (
            pitch_vertical
            if pitch_vertical is not None
            else data.VerticalLocation(random.randint(0, 4))
        )
        sample_pitch_horizontal = (
            pitch_horizontal
            if pitch_horizontal is not None
            else data.HorizontalLocation(random.randint(0, 4))
        )
        sample_swing_type = (
            swing_type
            if swing_type is not None
            else data.SwingType(random.randint(0, 1))
        )
        sample_swing_vertical = (
            swing_vertical
            if swing_vertical is not None
            else data.VerticalLocation(random.randint(0, 4))
        )
        sample_swing_horizontal = (
            swing_horizontal
            if swing_horizontal is not None
            else data.HorizontalLocation(random.randint(0, 4))
        )

        results.append(
            (
                sample_pitch_type,
                sample_pitch_vertical,
                sample_pitch_horizontal,
                sample_swing_type,
                sample_swing_vertical,
                sample_swing_horizontal,
                result(
                    sample_pitch_type,
                    sample_pitch_vertical,
                    sample_pitch_horizontal,
                    sample_swing_type,
                    sample_swing_vertical,
                    sample_swing_horizontal,
                ),
            )
        )

    return results


def handle_result(args: argparse.Namespace) -> None:
    print(
        result(
            data.PitchType(args.pitch_type),
            data.VerticalLocation(args.pitch_vertical),
            data.HorizontalLocation(args.pitch_horizontal),
            data.SwingType(args.swing_type),
            data.VerticalLocation(args.swing_vertical),
            data.HorizontalLocation(args.swing_horizontal),
        )
    )


def handle_rollout(args: argparse.Namespace) -> None:
    results = rollout(
        args.num_samples,
        data.PitchType(
            args.pitch_type) if args.pitch_type is not None else None,
        data.VerticalLocation(args.pitch_vertical)
        if args.pitch_vertical is not None
        else None,
        data.HorizontalLocation(args.pitch_horizontal)
        if args.pitch_horizontal is not None
        else None,
        data.SwingType(
            args.swing_type) if args.swing_type is not None else None,
        data.VerticalLocation(args.swing_vertical)
        if args.swing_vertical is not None
        else None,
        data.HorizontalLocation(args.swing_horizontal)
        if args.swing_horizontal is not None
        else None,
    )

    print(
        "pitch_type,pitch_vertical,pitch_horizontal,swing_type,swing_vertical,swing_horizontal,outcome"
    )
    for result in results:
        print(",".join([item.name for item in result]))


def generate_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Fullcount rules: Generation 1")
    parser.set_defaults(func=lambda _: parser.print_help())

    subparsers = parser.add_subparsers()

    result_parser = subparsers.add_parser("result")
    data.configure_move_type_handler(result_parser)
    result_parser.set_defaults(func=handle_result)

    rollout_parser = subparsers.add_parser("rollout")
    rollout_parser.add_argument(
        "--num-samples",
        "-n",
        type=int,
        default=100,
        help="Number of samples to generate",
    )
    data.configure_move_type_handler(rollout_parser, required=False)
    rollout_parser.set_defaults(func=handle_rollout)

    return parser


if __name__ == "__main__":
    parser = generate_cli()
    args = parser.parse_args()
    args.func(args)
