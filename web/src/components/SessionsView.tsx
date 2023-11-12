import { useGameContext } from "../contexts/GameContext";
import { Flex, Text } from "@chakra-ui/react";
import styles from "./SessionsView.module.css";
import globalStyles from "./OwnedTokens.module.css";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useContext } from "react";
import Web3Context from "../contexts/Web3Context/context";
import useMoonToast from "../hooks/useMoonToast";
import queryCacheProps from "../hooks/hookCommon";
import { decodeBase64Json } from "../utils/decoders";
import CharacterCard from "./CharacterCard";
import { Session, Token } from "../types";
import SessionView from "./SessionView";
import MySessions from "./MySessions";
import OwnedTokens from "./OwnedTokens";
import StakedTokens from "./StakedTokens";
import SessionViewSmall from "./SessionViewSmall";
import FiltersView from "./FiltersView";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../web3/abi/BLBABI.json");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const SessionsView = () => {
  const { selectedToken, updateContext, tokenAddress, contractAddress } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  tokenContract.options.address = tokenAddress;
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
      return gameContract.methods.startSession(tokenAddress, selectedToken?.id, role).send({
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
        toast("Start failed" + e?.message, "error");
      },
    },
  );

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

  const sessions = useQuery<Session[]>(
    ["sessions", web3ctx.account, web3ctx.chainId],
    async () => {
      console.log("sessions");

      const numSessions = await gameContract.methods.NumSessions().call();
      const secondsPerPhase = Number(await gameContract.methods.SecondsPerPhase().call());
      console.log(numSessions);
      const sessions = [];
      for (let i = 1; i <= numSessions; i += 1) {
        const progress = Number(await gameContract.methods.sessionProgress(i).call());
        const session = await gameContract.methods.getSession(i).call();
        const pair: { pitcher: Token | undefined; batter: Token | undefined } = {
          pitcher: undefined,
          batter: undefined,
        };
        if (session.pitcherAddress !== ZERO_ADDRESS) {
          const pitcherMetadata = decodeBase64Json(
            await tokenContract.methods.tokenURI(session.pitcherTokenID).call(),
          );
          const staker = await gameContract.methods
            .Staker(session.pitcherAddress, session.pitcherTokenID)
            .call();
          pair.pitcher = {
            id: session.pitcherTokenID,
            name: pitcherMetadata.name.split(` - `)[0],
            image: pitcherMetadata.image,
            staker,
          };
        }
        if (session.batterAddress !== ZERO_ADDRESS) {
          const batterMetadata = decodeBase64Json(
            await tokenContract.methods.tokenURI(session.batterTokenID).call(),
          );
          const staker = await gameContract.methods
            .Staker(session.batterAddress, session.batterTokenID)
            .call();
          pair.batter = {
            id: session.batterTokenID,
            name: batterMetadata.name.split(` - `)[0],
            image: batterMetadata.image,
            staker,
          };
        }

        sessions.push({
          pair,
          sessionID: i,
          progress,
          secondsPerPhase: secondsPerPhase,
          phaseStartTimestamp: Number(session.phaseStartTimestamp),
        });
        console.log({
          pair,
          sessionID: i,
          progress,
          secondsPerPhase,
          phaseStartTimestamp: session.phaseStartTimestamp,
        });
      }
      console.log(sessions);
      return sessions.reverse();
    },
    {
      onSuccess: (data) => {
        updateContext({ sessions: data });
      },
      ...queryCacheProps,
    },
  );

  const mySessions = (sessions: any[]) => {
    return sessions.filter(
      (session) =>
        session.pair.batter?.staker === web3ctx.account ||
        session.pair.pitcher?.staker === web3ctx.account,
    );
  };

  const notMySessions = (sessions: any[]) => {
    return sessions.filter(
      (session) =>
        session.pair.batter?.staker !== web3ctx.account &&
        session.pair.pitcher?.staker !== web3ctx.account,
    );
  };

  return (
    <Flex className={styles.container}>
      <Flex gap={"30px"}>
        <OwnedTokens />
        <StakedTokens />
      </Flex>
      {selectedToken && (
        <CharacterCard token={selectedToken} isActive={false} placeSelf={"start"} />
      )}

      <Text className={styles.title}>Sessions</Text>
      <FiltersView />
      <Flex gap={"20px"} justifyContent={"space-between"} w={"100%"}>
        <button className={globalStyles.button} onClick={() => startSession.mutate(0)}>
          Start new session as pitcher
        </button>
        <button className={globalStyles.button} onClick={() => startSession.mutate(1)}>
          Start new session as batter
        </button>
      </Flex>
      <Text className={styles.subtitle}>My sessions</Text>
      {sessions.data && mySessions(sessions.data).length > 0 && (
        <MySessions sessions={mySessions(sessions.data)} />
      )}
      <Text className={styles.subtitle}>Other sessions</Text>

      {sessions.data &&
        notMySessions(sessions.data).map((session, index: number) => (
          <SessionViewSmall
            session={session}
            onClick={(session: Session) => joinSession.mutate(session.sessionID)}
            key={index}
          />
        ))}
    </Flex>
  );
};

export default SessionsView;
