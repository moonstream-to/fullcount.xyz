import styles from "./SecondStep.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { Flex, Text, Button, Link } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import Web3Context from "../contexts/Web3Context/context";
import { supportedChains } from "../types";

const SecondStep = ({
  nextStep,
  chain,
}: {
  chain: { id: number; name: string | null };
  nextStep: () => void;
}) => {
  const web3Provider = useContext(Web3Context);
  useEffect(() => {
    if (web3Provider.buttonText === "Connected" && web3Provider.chainId === chain.id) {
      nextStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Provider.buttonText, web3Provider.chainId]);

  useEffect(() => {
    console.log(chain);
  }, []);

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
          onClick={() => web3Provider.changeChain(chain.name as supportedChains)}
        >
          {`Switch to ${chain.name}`}
        </button>
      )}
    </Flex>
  );
};

export default SecondStep;
