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

  const switchToWyrm = async () => {
    const wyrmID = 322;
    const hexString = `0x${wyrmID.toString(16)}`;
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
                chainName: "Wyrm",
                rpcUrls: ["https://wyrm.constellationchain.xyz/http"],
                blockExplorerUrls: ["https://wyrm.constellationchain.xyz/http"],
                nativeCurrency: { decimals: 18, name: "cMATIC", symbol: "cMATIC" },
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
        <button className={globalStyles.connectionButton} onClick={switchToWyrm}>
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
