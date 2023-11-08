import { useQuery, useMutation, useQueryClient } from "react-query";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
import styles from "./OwnedTokens.module.css";
import { Flex, Text } from "@chakra-ui/react";

const FullcountABI = require("../web3/abi/FullcountABI.json");
const token_ABI = require("../web3/abi/BLBABI.json");

const OwnedTokens = () => {
  return (
    <Flex className={styles.container}>
      <Text className={styles.title}>Your NFTs</Text>
      <button className={styles.button}>Mint</button>
    </Flex>
  );
};

export default OwnedTokens;
