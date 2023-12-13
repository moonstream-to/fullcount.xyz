import argparse

from . import BeerLeagueBallers, Fullcount, generation_1, randomness, generators, signatures


def generate_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="fullcount",
        description="Fullcount: A Python client to Fullcount.xyz",
        epilog="For more information, see https://github.com/moonstream-to/fullcount.xyz",
    )
    parser.set_defaults(func=lambda _: parser.print_help())

    subparsers = parser.add_subparsers()

    contract_parser = Fullcount.generate_cli()
    subparsers.add_parser("contract", parents=[contract_parser], add_help=False)

    generation_1_parser = generation_1.generate_cli()
    subparsers.add_parser("gen-1", parents=[generation_1_parser], add_help=False)

    blb_parser = BeerLeagueBallers.generate_cli()
    subparsers.add_parser("blb", parents=[blb_parser], add_help=False)

    randomness_parser = randomness.generate_cli()
    subparsers.add_parser("randomness", parents=[randomness_parser], add_help=False)

    codegen_parser = generators.generate_cli()
    subparsers.add_parser("codegen", parents=[codegen_parser], add_help=False)

    signatures_parser = signatures.generate_cli()
    subparsers.add_parser("signatures", parents=[signatures_parser], add_help=False)

    return parser


def main() -> None:
    parser = generate_cli()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
