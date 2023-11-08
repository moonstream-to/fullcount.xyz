import { useGameContext } from "../contexts/GameContext";
import { Flex, Text } from "@chakra-ui/react";
import styles from "./SessionsView.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useMutation, useQueryClient } from "react-query";
import { useContext } from "react";
import Web3Context from "../contexts/Web3Context/context";
import useMoonToast from "../hooks/useMoonToast";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");

const SessionsView = () => {
  const { selectedToken, updateContext, tokenAddress, contractAddress } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;
  const queryClient = useQueryClient();
  const toast = useMoonToast();

  const startSession = useMutation(
    async (role: number) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      console.log(tokenAddress, selectedToken, role);
      return gameContract.methods.startSession(tokenAddress, selectedToken, role).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("sessions");
      },
      onError: (e: Error) => {
        toast("Start failed" + e?.message, "error");
      },
    },
  );

  return (
    <Flex className={styles.container}>
      <Flex
        justifyContent={"space-between"}
        className={styles.session}
        w={"100%"}
        placeSelf={"stretch"}
        minW={"100%"}
      >
        <Text className={styles.title}>Sessions</Text>
        <Flex gap={"20px"}>
          <button className={globalStyles.button} onClick={() => startSession.mutate(1)}>
            Start new session as batter
          </button>
          <button className={globalStyles.button} onClick={() => startSession.mutate(0)}>
            Start new session as pitcher
          </button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default SessionsView;
