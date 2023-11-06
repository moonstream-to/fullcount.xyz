import argparse


def generate_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="fullcount-theory",
        description="Fullcount Theory: A tool to experiment with the game design and balance of Fullcount.xyz",
        epilog="For more information, see https://github.com/moonstream-to/fullcount.xyz",
    )
    parser.set_defaults(func=lambda _: parser.print_help())

    subparsers = parser.add_subparsers()

    return parser


def main() -> None:
    parser = generate_cli()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
