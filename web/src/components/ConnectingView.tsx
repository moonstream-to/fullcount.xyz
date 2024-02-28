import { useContext, useState } from "react";
import { Flex, Spinner, Text } from "@chakra-ui/react";

import Web3Context from "../contexts/Web3Context/context";
import { useGameContext } from "../contexts/GameContext";
import { chainByChainId } from "../contexts/Web3Context";

import { EthereumError } from "../types";
import globalStyles from "./tokens/OwnedTokens.module.css";
import styles from "./ConnectingView.module.css";

const ConnectingView = () => {
  const web3Provider = useContext(Web3Context);
  const [isSwitching, setIsSwitching] = useState(false);
  const { chainId } = useGameContext();

  type Chain = {
    chainIdDec: number;
    chainName: string;
    rpcUrls: string[];
    blockExplorerUrls: string[];
    nativeCurrency: {
      decimals: number;
      name: string;
      symbol: string;
    };
  };

  const WYRM: Chain = {
    chainIdDec: 322,
    chainName: "Wyrm",
    rpcUrls: ["https://wyrm.constellationchain.xyz/http"],
    blockExplorerUrls: ["https://wyrm.constellationchain.xyz/http"],
    nativeCurrency: { decimals: 18, name: "cMATIC", symbol: "cMATIC" },
  };

  const SEPOLIA = {
    chainName: "Arbitrum Sepolia",
    chainIdDec: 421614,
    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
    nativeCurrency: { decimals: 18, name: "SepoliaETH", symbol: "ETH" },
  };

  const switchToChain = async (chain: Chain) => {
    const hexString = `0x${chain.chainIdDec.toString(16)}`;
    setIsSwitching(true);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexString }],
      });
    } catch (switchError: unknown) {
      if ((switchError as EthereumError).code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexString,
                chainName: chain.chainName,
                rpcUrls: chain.rpcUrls,
                blockExplorerUrls: chain.blockExplorerUrls,
                nativeCurrency: chain.nativeCurrency,
              },
            ],
          });
        } catch (addError) {
          console.log(addError);
        }
      } else {
        console.log(switchError);
      }
    }
    setIsSwitching(false);
  };

  return (
    <Flex className={styles.container}>
      <Text className={styles.title}>Fullcount</Text>
      <Text className={styles.prompt}>Connect your wallet to continue</Text>
      <Text className={styles.text}>
        Connecting your wallet allows you to view and mint characters and select a character to play
        with.
      </Text>
      {web3Provider.buttonText !== "Connected" && (
        <button
          className={globalStyles.connectionButton}
          onClick={web3Provider.onConnectWalletClick}
        >
          Connect with Metamask
        </button>
      )}
      {web3Provider.buttonText === "Connected" && (
        <button className={globalStyles.connectionButton} onClick={() => switchToChain(SEPOLIA)}>
          {isSwitching ? (
            <Spinner h={"14px"} w={"14px"} />
          ) : (
            <Text>{`Switch to ${chainByChainId(chainId) ?? `chain #${chainId}`}`}</Text>
          )}
        </button>
      )}
    </Flex>
  );
};

export default ConnectingView;
