"""
Inspect randomness specified by Fullcount nonces
"""

import argparse
from typing import Optional

from brownie import web3
from eth_abi import encode
from tqdm import tqdm


def sample(nonce_1: int, nonce_2: int, denominator: int = 10000) -> int:
    assert denominator != 0, "denominator cannot be zero"
    combination_raw = web3.keccak(encode(["uint256", "uint256"], [nonce_1, nonce_2]))
    combination = web3.toInt(combination_raw)
    return combination % denominator


def grind(
    nonce_1: Optional[int], nonce_2: Optional[int], denominator: int, target: int
) -> int:
    assert (
        nonce_1 is not None or nonce_2 is not None
    ), "at least one nonce should be specified"

    is_valid = lambda x: sample(x, nonce_2, denominator) == target
    if nonce_2 is None:
        is_valid = lambda x: sample(nonce_1, x, denominator) == target

    candidate = 0
    with tqdm() as pbar:
        pbar.set_description(
            f"Grinding for nonce which produces the random sample {target}"
        )
        while not is_valid(candidate):
            candidate += 1
            pbar.update(1)

    return candidate


def handle_inspect(args: argparse.Namespace) -> None:
    sample = sample(args.nonce_1, args.nonce_2, args.denominator)
    if not args.test:
        print(
            f"Nonce 1: {args.nonce_1}, Nonce 2: {args.nonce_2}, Denominator: {args.denominator}"
        )
        print("Random sample:", sample)
    else:
        test_code = f"""
/**
* $ fullcount randomness inspect -n {args.nonce_1} -N {args.nonce_2} -d {args.denominator}
* Nonce 1: {args.nonce_1}, Nonce 2: {args.nonce_1}, Denominator: {args.denominator}
* Random sample: {sample}
*/
function test_{args.nonce_1}_{args.nonce_2}_{args.denominator}_{sample}() public {{
    assertEq(game.randomSample({args.nonce_1}, {args.nonce_2}, {args.denominator}), {sample});
}}
"""
        print(test_code)


def handle_grind(args: argparse.Namespace) -> None:
    result = grind(args.nonce_1, args.nonce_2, args.denominator, args.target)
    print(result)


def generate_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Inspect randomness specified by Fullcount nonces"
    )
    parser.set_defaults(func=lambda _: parser.print_help())

    subparsers = parser.add_subparsers()

    inspect_parser = subparsers.add_parser(
        "inspect", help="Inspect randomness specified by Fullcount nonces"
    )
    inspect_parser.add_argument(
        "-n", "--nonce-1", required=True, type=int, help="Nonce 1"
    )
    inspect_parser.add_argument(
        "-N", "--nonce-2", required=True, type=int, help="Nonce 2"
    )
    inspect_parser.add_argument(
        "-d",
        "--denominator",
        required=False,
        type=int,
        default=10000,
        help="Denominator (default: 10,000)",
    )
    inspect_parser.add_argument(
        "-t",
        "--test",
        action="store_true",
        help="If this flag is set, the output also generates a test that can be included in test/RandomnessConsistency.t.sol",
    )

    inspect_parser.set_defaults(func=handle_inspect)

    grind_parser = subparsers.add_parser(
        "grind",
        help="Find a nonce which, when paired with a given nonce produces the target sample",
    )
    grind_parser.add_argument(
        "-n", "--nonce-1", required=False, type=int, default=None, help="Nonce 1"
    )
    grind_parser.add_argument(
        "-N", "--nonce-2", required=False, type=int, default=None, help="Nonce 2"
    )
    grind_parser.add_argument(
        "-d",
        "--denominator",
        required=False,
        type=int,
        default=10000,
        help="Denominator (default: 10,000)",
    )
    grind_parser.add_argument(
        "-t", "--target", required=True, type=int, help="Sample to grind for"
    )

    grind_parser.set_defaults(func=handle_grind)

    return parser
