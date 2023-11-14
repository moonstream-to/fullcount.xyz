import { Flex, Text } from "@chakra-ui/react";
import CharacterCard from "./CharacterCard";
import globalStyles from "./OwnedTokens.module.css";
import { Session } from "../types";
import { useGameContext } from "../contexts/GameContext";
import Timer from "./Timer";
import { useContext } from "react";
import Web3Context from "../contexts/Web3Context/context";
import CharacterCardSmall from "./CharacterCardSmall";
import { useMutation, useQueryClient } from "react-query";
import * as querystring from "querystring";
import useMoonToast from "../hooks/useMoonToast";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");

export const sessionStates = [
  "session does not exist",
  "session aborted",
  "session started, but second player has not yet joined",
  "session started, both players joined, ready for commitments",
  "both players committed, ready for reveals",
  "session complete",
  "session expired",
];

const SessionView3 = ({ session }: { session: Session }) => {
  const { progressFilter, tokenAddress, selectedToken, contractAddress } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;
  const queryClient = useQueryClient();
  const toast = useMoonToast();

  const joinSession = useMutation(
    async (sessionID: number) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      console.log(sessionID, tokenAddress, selectedToken);
      return gameContract.methods.joinSession(sessionID, tokenAddress, selectedToken?.id).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("sessions");
        queryClient.invalidateQueries("owned_tokens");
      },
      onError: (e: Error) => {
        toast("Join failed" + e?.message, "error");
      },
    },
  );

  const handleClick = () => {
    console.log(session);
    joinSession.mutate(session.sessionID);
  };
  if (!progressFilter[session.progress]) {
    return <></>;
  }

  const progressMessages = [
    "does not exist",
    "Aborted",
    "Waiting for Opponent",
    "In progress",
    "In progress",
    "Complete",
    "Expired",
  ];
  const progressMessageColors = [
    "#FF8D8D",
    "#FF8D8D",
    "#FFDA7A",
    "#00B94A",
    "#00B94A",
    "#FFFFFF",
    "#FF8D8D",
  ];

  return (
    <Flex justifyContent={"space-between"} w={"100%"} alignItems={"center"} py={"15px"}>
      <Flex direction={"column"}>
        {`Session ${session.sessionID}`}
        {/*<Text fontSize={"14px"}>{sessionStates[session.progress]}</Text>*/}
      </Flex>
      <Text color={progressMessageColors[session.progress]}>
        {progressMessages[session.progress]}
      </Text>

      <Flex gap={"50px"} alignItems={"center"} justifyContent={"space-between"} minW={"480px"}>
        {session.pair.pitcher ? (
          <Flex gap={4}>
            <CharacterCardSmall token={session.pair.pitcher} session={session} minW={"215px"} />
          </Flex>
        ) : (
          <>
            {session.progress === 2 && (
              <button className={globalStyles.joinButton} onClick={handleClick}>
                join as pitcher
              </button>
            )}
          </>
        )}
        {session.pair.batter ? (
          <Flex gap={4}>
            <CharacterCardSmall token={session.pair.batter} session={session} minW={"215px"} />
          </Flex>
        ) : (
          <>
            {session.progress === 2 && (
              <button className={globalStyles.joinButton} onClick={handleClick}>
                join as batter
              </button>
            )}
          </>
        )}
      </Flex>
      {/*<button className={globalStyles.spectateButton}>Spectate</button>*/}
    </Flex>
  );
};

export default SessionView3;
