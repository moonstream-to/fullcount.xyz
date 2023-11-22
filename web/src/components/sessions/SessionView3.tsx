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
  const { updateContext, progressFilter, tokenAddress, selectedToken, contractAddress, sessions } =
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
      return gameContract.methods.joinSession(sessionID, tokenAddress, selectedToken?.id).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: (_, variables) => {
        queryClient.setQueryData(["sessions"], (oldData: any) => {
          const newSessions = oldData.map((s: Session) => {
            if (s.sessionID !== variables) {
              return s;
            }
            if (!s.pair.batter) {
              return { ...s, progress: 3, pair: { ...s.pair, batter: selectedToken } };
            }
            if (!s.pair.pitcher) {
              return { ...s, progress: 3, pair: { ...s.pair, pitcher: { ...selectedToken } } };
            }
          });
          updateContext({
            sessions: newSessions,
            selectedSession: newSessions?.find((s: Session) => s.sessionID === variables),
          });
          return newSessions;
        });
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
    joinSession.mutate(session.sessionID);
  };

  if (!progressFilter[session.progress]) {
    return <></>;
  }

  const progressMessage = () => {
    if (session.progress === 1) {
      return "aborted";
    }
    if (session.progress === 6) {
      return "expired";
    }
    if (session.progress === 2) {
      if (session.pair.pitcher) {
        return `${session.pair.pitcher.name} is waiting for a batter`;
      }
      return `${session.pair.batter?.name} is waiting for a pitcher`;
    }
    if (session.progress === 3) {
      if (!session.didPitcherCommit && !session.didBatterCommit) {
        return `${session.pair.pitcher?.name} is pitching to ${session.pair.batter?.name}`;
      }
      if (session.didPitcherCommit) {
        return `${session.pair.pitcher?.name} is winding up`;
      }
      return `${session.pair.batter?.name} is ready`;
    }
    if (session.progress === 4) {
      if (!session.didPitcherReveal && !session.didBatterReveal) {
        return `Here comes the pitch…`;
      }
      if (session.didPitcherReveal) {
        return `${session.pair.pitcher?.name} reveals`;
      }
      return `${session.pair.batter?.name} reveals`;
    }
    if (session.progress === 5) {
      if (Number(session.outcome) > 1 && Number(session.outcome) < 6) {
        return `A hit! ${session.pair.batter?.name} wins it for the home team`;
      }
      if (Number(session.outcome) === 1) {
        return `Ball four! ${session.pair.batter?.name}’s eye has tied the game for the home team`;
      }
      if (Number(session.outcome) === 6) {
        return `${session.pair.pitcher?.name} secures the win for the visitors`;
      }
      return `Strike three! ${session.pair.pitcher?.name} wins it for the visitors `;
    }
  };
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
      <Text color={progressMessageColors[session.progress]}>{progressMessage()}</Text>

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
