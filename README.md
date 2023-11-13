# Fullcount.xyz

This repository contains all code related to the Fullcount.xyz autonomous, web3, baseball game.

## Smart contracts

### Development

Fullcount uses [Foundry](https://book.getfoundry.sh/) to build and test smart contracts.

We use the [`fullcount` CLI](python/README.md) to deploy and run operations related to the `Fullcount` contract.

#### Build

```shell
$ forge build
```

#### Test

```shell
$ forge test
```

#### Format

```shell
$ forge fmt
```

#### Gas Snapshots

```shell
$ forge snapshot
```

#### Deployment and operations

Please see [the README for the Fullcount Python client](python/README.md).

## Frontend

## Game balance and tuning

The [Python client](python/README.md) contains utilities that we use to help tune and balance the
game across versions.
