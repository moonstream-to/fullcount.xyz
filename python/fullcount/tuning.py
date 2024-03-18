"""
Inspect randomness specified by Fullcount nonces
"""

import argparse
import random
from typing import Optional, List, Tuple
from collections import defaultdict

from . import data


def distance_frequencies(vertical: int, horizontal: int) -> None:
    print(("Calculating frequencies for ({}, {}).").format(vertical, horizontal))
    pitch_type = data.PitchType(0)
    pitch_vertical = data.VerticalLocation(vertical)
    pitch_horizontal = data.HorizontalLocation(horizontal)
    distance_frequencies = defaultdict(int)
    total_distance = 0
    for v in range(0, 5):
        for h in range(0, 5):
            swing_type = data.SwingType(0)
            swing_vertical = data.VerticalLocation(v)
            swing_horizontal = data.HorizontalLocation(h)
            distance = data.l1_distance(
                pitch_type, pitch_vertical, pitch_horizontal, swing_type, swing_vertical, swing_horizontal)
            total_distance += distance
            distance_frequencies[distance] = distance_frequencies[distance] + 1

    # Print the entire dictionary
    for key, value in distance_frequencies.items():
        print(f"Distance {key} has frequency {value}.")

    avg_dist = total_distance/25

    print(f"Average distance is {avg_dist}")


def handle_average_distance(args: argparse.Namespace) -> None:
    distance_frequencies(args.vertical, args.horizontal)
    result = []
    # result = grind(args.nonce_1, args.nonce_2, args.denominator, args.target)
    print(result)


def generate_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Calculate distances for fullcount."
    )
    parser.set_defaults(func=lambda _: parser.print_help())

    subparsers = parser.add_subparsers()

    average_distance_parser = subparsers.add_parser(
        "distance",
        help="Calculate average distance of a random square from specified location. Also show number of squares at each distance.",
    )
    average_distance_parser.add_argument(
        "-V",
        "--vertical",
        required=True,
        type=int,
        default=0,
        help="Vertical location",
    )
    average_distance_parser.add_argument(
        "-H",
        "--horizontal",
        required=True,
        type=int,
        default=0,
        help="Horizontal location",
    )

    average_distance_parser.set_defaults(func=handle_average_distance)

    return parser
