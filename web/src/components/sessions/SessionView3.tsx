import { Flex, Spinner, Text } from "@chakra-ui/react";
import globalStyles from "../tokens/OwnedTokens.module.css";
import { Session, Token } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import { useContext } from "react";
import Web3Context from "../../contexts/Web3Context/context";
import CharacterCardSmall from "../tokens/CharacterCardSmall";
import { useMutation, useQueryClient } from "react-query";
import useMoonToast from "../../hooks/useMoonToast";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../../web3/abi/FullcountABI.json");

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
  const { progressFilter, tokenAddress, selectedToken, contractAddress, sessions } =
    useGameContext();
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

  const isTokenStaked = (token: Token) => {
    return sessions?.find(
      (s) =>
        (s.pair.pitcher?.id === token.id &&
          s.pair.pitcher?.address === token.address &&
          !s.pitcherLeft) ||
        (s.pair.batter?.id === token.id &&
          s.pair.batter?.address === token.address &&
          !s.batterLeft),
    );
  };

  const handleClick = () => {
    if (!selectedToken || isTokenStaked(selectedToken)) {
      toast("Select character first", "error");
      return;
    }
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
            <CharacterCardSmall
              token={session.pair.pitcher}
              session={session}
              minW={"215px"}
              isClickable={
                session.progress === 5 || session.pair.pitcher.staker === web3ctx.account
              }
              isOwned={session.pair.pitcher.staker === web3ctx.account}
            />
          </Flex>
        ) : (
          <>
            {session.progress === 2 && (
              <button className={globalStyles.joinButton} onClick={handleClick}>
                {joinSession.isLoading ? <Spinner /> : "join as pitcher"}
              </button>
            )}
          </>
        )}
        {session.pair.batter ? (
          <Flex gap={4}>
            <CharacterCardSmall
              token={session.pair.batter}
              session={session}
              minW={"215px"}
              isClickable={session.progress === 5 || session.pair.batter.staker === web3ctx.account}
              isOwned={session.pair.batter.staker === web3ctx.account}
            />
          </Flex>
        ) : (
          <>
            {session.progress === 2 && (
              <button className={globalStyles.joinButton} onClick={handleClick}>
                {joinSession.isLoading ? <Spinner /> : "join as batter"}
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
