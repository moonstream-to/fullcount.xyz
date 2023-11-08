"""
Inspect randomness specified by Fullcount nonces
"""

import argparse

from brownie import web3
from eth_abi import encode


def randomness(nonce_1: int, nonce_2: int, denominator: int = 10000) -> int:
    assert denominator != 0, "denominator cannot be zero"
    combination_raw = web3.keccak(encode(["uint256", "uint256"], [nonce_1, nonce_2]))
    combination = web3.toInt(combination_raw)
    return combination % denominator


def handle_randomness(args: argparse.Namespace) -> None:
    sample = randomness(args.nonce_1, args.nonce_2, args.denominator)
    if not args.test:
        print(
            f"Nonce 1: {args.nonce_1}, Nonce 2: {args.nonce_2}, Denominator: {args.denominator}"
        )
        print("Random sample:", sample)
    else:
        test_code = f"""
/**
* $ fullcount randomness -n {args.nonce_1} -N {args.nonce_2} -d {args.denominator}
* Nonce 1: {args.nonce_1}, Nonce 2: {args.nonce_1}, Denominator: {args.denominator}
* Random sample: {sample}
*/
function test_{args.nonce_1}_{args.nonce_2}_{args.denominator}_{sample}() public {{
    assertEq(game.randomSample({args.nonce_1}, {args.nonce_2}, {args.denominator}), {sample});
}}
"""
        print(test_code)


def generate_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Inspect randomness specified by Fullcount nonces"
    )

    parser.add_argument("-n", "--nonce-1", required=True, type=int, help="Nonce 1")
    parser.add_argument("-N", "--nonce-2", required=True, type=int, help="Nonce 2")
    parser.add_argument(
        "-d",
        "--denominator",
        required=False,
        type=int,
        default=10000,
        help="Denominator (default: 10,000)",
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="If this flag is set, the output also generates a test that can be included in test/RandomnessConsistency.t.sol",
    )

    parser.set_defaults(func=handle_randomness)

    return parser
