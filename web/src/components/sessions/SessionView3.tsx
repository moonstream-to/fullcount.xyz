import { Box, Flex, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import globalStyles from "../tokens/OwnedTokens.module.css";
import { OwnedToken, Session, Token } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import { useContext, useEffect } from "react";
import Web3Context from "../../contexts/Web3Context/context";
import CharacterCardSmall from "../tokens/CharacterCardSmall";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useMoonToast from "../../hooks/useMoonToast";
import { progressMessage } from "../../utils/messages";
import SelectToken from "./SelectToken";
import { sendTransactionWithEstimate } from "../../utils/sendTransactions";
import DotsCounter from "./DotsCounter";
import styles from "./SessionView.module.css";
import { joinSessionBLB } from "../../tokenInterfaces/BLBTokenAPI";
import { joinSessionFullcountPlayer } from "../../tokenInterfaces/FullcountPlayerAPI";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../../web3/abi/FullcountABI.json");

export const sessionStates = [
  "session does not exist",
  "aborted",
  "session started, but second player has not yet joined",
  "session started, both players joined, ready for commitments",
  "both players committed, ready for reveals",
  "session complete",
  "expired",
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
    async ({ sessionID, token }: { sessionID: number; token: OwnedToken }) => {
      switch (token.source) {
        case "BLBContract":
          return joinSessionBLB({ web3ctx, token, sessionID, inviteCode: undefined });
        case "FullcountPlayerAPI":
          return joinSessionFullcountPlayer({ token, sessionID, inviteCode: undefined });
        default:
          return Promise.reject(new Error(`Unknown or unsupported token source: ${token.source}`));
      }
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

  const outcomes = [
    "In Progress",
    "Strikeout",
    "Walk",
    "Single",
    "Double",
    "Triple",
    "Home Run",
    "In Play Out",
  ];

  return (
    <Flex
      justifyContent={"space-between"}
      w={"100%"}
      alignItems={{ base: "start", lg: "center" }}
      py={"15px"}
      direction={{ base: "column", lg: "row" }}
    >
      {/*<Text*/}
      {/*  color={progressMessageColors[session.progress]}*/}
      {/*  title={`Session ${session.sessionID}. Progress - ${session.progress}`}*/}
      {/*>*/}
      {/*  {progressMessage(session)}*/}
      {/*</Text>*/}
      {session.atBat && session.atBatID && (
        <Flex gap={"15px"} p={"5px 0px"} alignItems={"center"}>
          <DotsCounter label={"ball"} count={session.atBat.balls} capacity={4} />
          <DotsCounter label={"strike"} count={session.atBat.strikes} capacity={3} />
          <Box h={"23px"} bg={"#4d4d4d"} w={"0.5px"} />
          <Text
            className={
              session.progress === 6 || session.progress === 1
                ? styles.expired
                : Number(session.atBat.outcome) === 0
                ? styles.inProcess
                : styles.finished
            }
          >
            {session.progress === 6 || session.progress === 1
              ? sessionStates[session.progress]
              : outcomes[Number(session.atBat.outcome)]}
          </Text>
          {/*<Text>{`AtBat #${session.atBatID}/${session.sessionID}`}</Text>*/}
        </Flex>
      )}

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
