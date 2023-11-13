import { useQuery, useMutation, useQueryClient } from "react-query";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
import styles from "./OwnedTokens.module.css";
import { Flex, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import Web3Context from "../contexts/Web3Context/context";
import { useContext } from "react";
import { useGameContext } from "../contexts/GameContext";
import useMoonToast from "../hooks/useMoonToast";
import CreateNewCharacter from "./CreateNewCharacter";
import queryCacheProps from "../hooks/hookCommon";
import CharacterCard from "./CharacterCard";
import { decodeBase64Json } from "../utils/decoders";
import { Token } from "../types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../web3/abi/BLBABI.json");

const StakedTokens = () => {
  const web3ctx = useContext(Web3Context);
  const { tokenAddress, contractAddress, selectedToken, updateContext, sessions } =
    useGameContext();
  const queryClient = useQueryClient();
  const toast = useMoonToast();
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  tokenContract.options.address = tokenAddress;
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const unstakeNFT = useMutation(
    async (token: Token) => {
      if (tokenProgress(token) === 2 && tokenSessionID(token)) {
        return gameContract.methods.abortSession(tokenSessionID(token)).send({
          from: web3ctx.account,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
        });
      }
      if (tokenProgress(token) === 5 || tokenProgress(token) === 6) {
        return gameContract.methods.unstakeNFT(token.address, token.id).send({
          from: web3ctx.account,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
        });
      }
    },
    {
      onSuccess: () => {
        // queryClient.invalidateQueries("sessions");
        queryClient.refetchQueries("sessions");
        queryClient.refetchQueries("owned_tokens");
        toast("Unstake successful.", "success");
      },
      onError: (e: Error) => {
        toast("Unstake failed." + e?.message, "error");
      },
    },
  );

  const tokenProgress = (token: Token) => {
    return sessions?.find(
      (session) => session.pair.pitcher?.id === token.id || session.pair.batter?.id === token.id,
    )?.progress;
  };

  const tokenSessionID = (token: Token) => {
    return sessions?.find(
      (session) => session.pair.pitcher?.id === token.id || session.pair.batter?.id === token.id,
    )?.sessionID;
  };

  return (
    <>
      <Flex className={styles.cards} alignItems={"end"}>
        {sessions &&
          sessions
            .map((session) =>
              [session.pair.pitcher, session.pair.batter].filter(
                (token): token is Token => !!token,
              ),
            )
            .flat()
            .filter((token) => token?.staker === web3ctx.account)
            .map((token: Token, idx: number) => (
              <CharacterCard
                token={token}
                key={idx}
                isActive={false}
                maxW={"70px"}
                maxH={"85px"}
                border={selectedToken?.id === token.id ? "1px solid white" : "1px solid #4D4D4D"}
                showName={false}
                isClickable={false}
              >
                <button className={styles.button} onClick={() => unstakeNFT.mutate(token)}>
                  {`unstake ${
                    sessions.find(
                      (session) =>
                        session.pair.pitcher?.id === token.id ||
                        session.pair.batter?.id === token.id,
                    )?.progress
                  }`}
                </button>
              </CharacterCard>
            ))}
      </Flex>
    </>
  );
};

export default StakedTokens;
