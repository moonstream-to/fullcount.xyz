import styles from "./ConnectingView.module.css";
import globalStyles from "./tokens/OwnedTokens.module.css";
import { Flex, Text } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import Web3Context from "../contexts/Web3Context/context";
import { supportedChains } from "../types";
import { useGameContext } from "../contexts/GameContext";
import { chainByChainId } from "../contexts/Web3Context";

const ConnectingView = ({ nextStep }: { nextStep: () => void }) => {
  const web3Provider = useContext(Web3Context);
  const { chainId } = useGameContext();
  useEffect(() => {
    if (web3Provider.buttonText === "Connected" && web3Provider.chainId === chainId) {
      nextStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Provider.buttonText, web3Provider.chainId]);

  return (
    <Flex className={styles.container}>
      <Text className={styles.title}>Fullcount</Text>
      <Text className={styles.prompt}>Connect your wallet to continue</Text>
      <Text className={styles.text}>
        Connecting your wallet allows you to view and mint characters and select a character to play
        with.
      </Text>
      {web3Provider.buttonText !== "Connected" && (
        <button className={globalStyles.button} onClick={web3Provider.onConnectWalletClick}>
          Connect with Metamask
        </button>
      )}
      {web3Provider.buttonText === "Connected" && (
        <button
          className={globalStyles.button}
          onClick={() => web3Provider.changeChain(chainByChainId(chainId) as supportedChains)}
        >
          {`Switch to ${chainByChainId(chainId) ?? `chain #${chainId}`}`}
        </button>
      )}
    </Flex>
  );
};

export default ConnectingView;
