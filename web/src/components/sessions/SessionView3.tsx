import { Flex, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import globalStyles from "../tokens/OwnedTokens.module.css";
import { OwnedToken, Session, Token } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import { useContext } from "react";
import Web3Context from "../../contexts/Web3Context/context";
import CharacterCardSmall from "../tokens/CharacterCardSmall";
import { useMutation, useQueryClient } from "react-query";
import useMoonToast from "../../hooks/useMoonToast";
import { progressMessage } from "../../utils/messages";
import SelectToken from "./SelectToken";
import { sendTransactionWithEstimate } from "../../utils/sendTransactions";
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
  const {
    isOpen: isSelectTokenOpen,
    onOpen: onSelectTokenOpen,
    onClose: onSelectTokenClose,
  } = useDisclosure();

  const joinSession = useMutation(
    async ({ sessionID, token }: { sessionID: number; token: Token }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }
      const signature = "0x";
      return sendTransactionWithEstimate(
        web3ctx.account,
        gameContract.methods.joinSession(sessionID, tokenAddress, token.id, signature),
      );
    },
    {
      onSuccess: (_, variables) => {
        queryClient.setQueryData(["sessions"], (oldData: Session[] | undefined) => {
          if (!oldData) {
            return [];
          }
          const newSessions = oldData.map((s: Session) => {
            if (s.sessionID !== variables.sessionID) {
              return s;
            }
            if (!s.pair.pitcher) {
              return { ...s, progress: 3, pair: { ...s.pair, pitcher: { ...variables.token } } };
            }
            if (!s.pair.batter) {
              return { ...s, progress: 3, pair: { ...s.pair, batter: { ...variables.token } } };
            }
            return s;
          });
          updateContext({
            sessions: newSessions,
            selectedSession: newSessions?.find((s: Session) => s.sessionID === variables.sessionID),
          });

          return newSessions ?? [];
        });
        queryClient.setQueryData(["owned_tokens"], (oldData: OwnedToken[] | undefined) => {
          if (!oldData) {
            return [];
          }
          return oldData.map((t) => {
            if (t.address === variables.token.address && t.id === variables.token.id) {
              return {
                ...t,
                isStaked: true,
                stakedSessionID: variables.sessionID,
                tokenProgress: 3,
              };
            }
            return t;
          });
        });
      },
      onError: (e: Error) => {
        toast("Join failed" + e?.message, "error");
      },
    },
  );

  const handleClick = () => {
    if (!selectedToken) {
      updateContext({ invitedTo: session.sessionID });
      onSelectTokenOpen();
      return;
    }
    if (selectedToken?.stakedSessionID) {
      updateContext({ invitedTo: session.sessionID, selectedToken: undefined });
      onSelectTokenOpen();
      return;
    }
    joinSession.mutate({ sessionID: session.sessionID, token: selectedToken });
  };

  if (!progressFilter[session.progress]) {
    return <></>;
  }

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
    <Flex
      justifyContent={"space-between"}
      w={"100%"}
      alignItems={{ base: "start", lg: "center" }}
      py={"15px"}
      direction={{ base: "column", lg: "row" }}
    >
      <Text
        color={progressMessageColors[session.progress]}
        title={`Session ${session.sessionID}. Progress - ${session.progress}`}
      >
        {progressMessage(session)}
      </Text>

      <Flex
        alignItems={{ base: "start", lg: "center" }}
        justifyContent={"space-between"}
        minW={{ base: "", lg: "480px" }}
        direction={{ base: "column", lg: "row" }}
        gap={{ base: "10px", lg: "50px" }}
      >
        <SelectToken isOpen={isSelectTokenOpen} onClose={onSelectTokenClose} />
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
            {session.progress === 2 && !session.requiresSignature && (
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
            {session.progress === 2 && !session.requiresSignature && (
              <button className={globalStyles.joinButton} onClick={handleClick}>
                {joinSession.isLoading ? <Spinner /> : "join as batter"}
              </button>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default SessionView3;
