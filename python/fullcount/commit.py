"""
Generates a commitment - either to a pitch or to a swing
"""

import argparse
from typing import Any, Tuple

from brownie import network
from eth_account._utils.signing import sign_message_hash
import eth_keys
from hexbytes import HexBytes

from .data import PitchType, SwingType, VerticalLocation, HorizontalLocation
from .Fullcount import add_default_arguments, Fullcount, get_transaction_config


def sign_message(message_hash, signer) -> str:
    eth_private_key = eth_keys.keys.PrivateKey(HexBytes(signer.private_key))
    message_hash_bytes = HexBytes(message_hash)
    _, _, _, signed_message_bytes = sign_message_hash(
        eth_private_key, message_hash_bytes
    )
    return signed_message_bytes.hex()


def commit_pitch(
    contract: Fullcount,
    signer: Any,
    nonce: int,
    pitch_speed: PitchType,
    pitch_vert: VerticalLocation,
    pitch_hor: HorizontalLocation,
) -> Tuple[str, str]:
    """
    Generates a commitment to a pitch
    """
    message_hash = contract.pitch_hash(
        nonce, pitch_speed.value, pitch_vert.value, pitch_hor.value
    )
    return message_hash, sign_message(message_hash, signer)


def commit_swing(
    contract: Fullcount,
    signer: Any,
    nonce: int,
    swing_type: SwingType,
    swing_vert: VerticalLocation,
    swing_hor: HorizontalLocation,
) -> Tuple[str, str]:
    """
    Generates a commitment to a swing
    """
    message_hash = contract.swing_hash(
        nonce, swing_type.value, swing_vert.value, swing_hor.value
    )
    return message_hash, sign_message(message_hash, signer)


def handle_commit_pitch(args: argparse.Namespace) -> None:
    network.connect(args.network)
    signer = network.accounts.load(args.sender, args.password)
    contract = Fullcount(args.address)
    nonce = args.commit_nonce
    pitch_speed = PitchType(args.commit_type)
    pitch_vert = VerticalLocation(args.commit_vert)
    pitch_hor = HorizontalLocation(args.commit_hor)
    message_hash, signature = commit_pitch(
        contract, signer, nonce, pitch_speed, pitch_vert, pitch_hor
    )
    print(f"Message hash: {message_hash}\nSignature: {signature}")

    if args.submit:
        if args.session_id is None:
            raise ValueError("--session-id required when submitting commitment")
        tx_config = get_transaction_config(args)
        contract.commit_pitch(args.session_id, signature, tx_config)


def handle_commit_swing(args: argparse.Namespace) -> None:
    network.connect(args.network)
    signer = network.accounts.load(args.sender, args.password)
    contract = Fullcount(args.address)
    nonce = args.commit_nonce
    swing_type = SwingType(args.commit_type)
    swing_vert = VerticalLocation(args.commit_vert)
    swing_hor = HorizontalLocation(args.commit_hor)
    message_hash, signature = commit_swing(
        contract, signer, nonce, swing_type, swing_vert, swing_hor
    )
    print(f"Message hash: {message_hash}\nSignature: {signature}")

    if args.submit:
        if args.session_id is None:
            raise ValueError("--session-id required when submitting commitment")
        tx_config = get_transaction_config(args)
        contract.commit_swing(args.session_id, signature, tx_config)


def generate_cli() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate pitch and swing commitments")
    parser.set_defaults(func=lambda _: parser.print_help())

    subparsers = parser.add_subparsers()

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

    pitch_parser = subparsers.add_parser("pitch")
    add_default_arguments(pitch_parser, transact=True)
    pitch_parser.add_argument("--commit-nonce", type=int, required=True, help="Nonce")
    pitch_parser.add_argument("--commit-type", type=int, help=pitch_type_help)
    pitch_parser.add_argument("--commit-vert", type=int, help=vert_help)
    pitch_parser.add_argument("--commit-hor", type=int, help=hor_help)
    pitch_parser.add_argument(
        "--submit",
        action="store_true",
        help="Set this flag to actually submit the commitment on-chain",
    )
    pitch_parser.add_argument(
        "--session-id",
        type=int,
        required=False,
        default=None,
        help="Session ID, required if --submit is set",
    )
    pitch_parser.set_defaults(func=handle_commit_pitch)

    swing_parser = subparsers.add_parser("swing")
    add_default_arguments(swing_parser, transact=True)
    swing_parser.add_argument("--commit-nonce", type=int, required=True, help="Nonce")
    swing_parser.add_argument("--commit-type", type=int, help=swing_type_help)
    swing_parser.add_argument("--commit-vert", type=int, help=vert_help)
    swing_parser.add_argument("--commit-hor", type=int, help=hor_help)
    swing_parser.add_argument(
        "--submit",
        action="store_true",
        help="Set this flag to actually submit the commitment on-chain",
    )
    swing_parser.add_argument(
        "--session-id",
        type=int,
        required=False,
        default=None,
        help="Session ID, required if --submit is set",
    )
    swing_parser.set_defaults(func=handle_commit_swing)

    return parser


if __name__ == "__main__":
    parser = generate_cli()
    args = parser.parse_args()
    args.func(args)
