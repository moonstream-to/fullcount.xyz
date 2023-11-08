# Python client for Fullcount.xyz

This directory contains the Python client library for Fullcount.xyz.

All on-chain interactions rely on the existence of `forge` build artifacts in the repository root
directory -- the client uses the latest ABI, bytecode, etc. from the `out/` directory created
by `forge build`.

## Installation

To install in a Python environment, run the following commands *from this directory*:

```bash
export BROWNIE_LIB=1
pip install -e .
```

## Usage

The Python client is based on [`brownie`](https://github.com/eth-brownie/brownie).

### In Python

To import the contract into your own code:

```python
from fullcount.Fullcount import Fullcount
```

To deploy a fresh instance of the contract:

```python
from brownie import network, ZERO_ADDRESS
from fullcount.Fullcount import Fullcount

network.connect("<insert network name here>")

sender = network.accounts.load("<path to account keyfile>", "<account password>")

contract = Fullcount(None)
contract.deploy(0, 0, ZERO_ADDRESS, 300, {"from": sender})
```

To interact with an existing deployment:

```python
from brownie import network
from fullcount.Fullcount import Fullcount

network.connect("<insert network name here>")

contract = Fullcount("<deployed contract address>")
print("Number of sessions on contract: ", contract.num_sessions())
```

### CLI

```
fullcount -h
```

## Development

If you want to install developer dependencies:

```bash
export BROWNIE_LIB=1
pip install -e .[dev]
```

To regenerate the Python interface to the `Fullcount` contract:

```bash
moonworm generate-brownie -o fullcount -p ../ -n Fullcount --foundry
```

To regenerate the Python interface to the `BeerLeagueBallers` NFT contract:

```bash
moonworm generate-brownie -o fullcount -p ../ --foundry -n BeerLeagueBallers --sol-filename Players.sol
```
