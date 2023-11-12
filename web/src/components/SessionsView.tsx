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
import { MULTICALL2_CONTRACT_ADDRESSES } from "../constants";
import { outputs } from "../web3/abi/ABIITems";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../web3/abi/BLBABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const multicallABI = require("../web3/abi/Multicall2.json");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const SessionsView = () => {
  const { selectedToken, updateContext, tokenAddress, contractAddress } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  tokenContract.options.address = tokenAddress;
  const MULTICALL2_CONTRACT_ADDRESS =
    MULTICALL2_CONTRACT_ADDRESSES[
      String(web3ctx.chainId) as keyof typeof MULTICALL2_CONTRACT_ADDRESSES
    ];
  console.log(web3ctx.chainId, MULTICALL2_CONTRACT_ADDRESS);
  const multicallContract = new web3ctx.web3.eth.Contract(
    multicallABI,
    MULTICALL2_CONTRACT_ADDRESS,
  );

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
      const target = contractAddress;
      const callDatas = [];
      for (let i = 1; i <= numSessions; i += 1) {
        callDatas.push(gameContract.methods.sessionProgress(i).encodeABI());
        callDatas.push(gameContract.methods.getSession(i).encodeABI());
      }
      const queries = callDatas.map((callData) => {
        return {
          target,
          callData,
        };
      });

      const multicallRes = await multicallContract.methods.tryAggregate(false, queries).call();
      const res = [];
      for (let i = 0; i < multicallRes.length; i += 2) {
        res.push({ progress: multicallRes[i][1], session: multicallRes[i + 1][1] });
      }
      const decodedRes = res.map((data: any) => {
        return {
          progress: Number(data.progress),
          session: web3ctx.web3.eth.abi.decodeParameters(outputs, data.session)[0],
        };
      });

      const tokens: any[] = [];
      decodedRes.forEach((res) => {
        if (res.session.pitcherAddress !== ZERO_ADDRESS) {
          tokens.push({ address: res.session.pitcherAddress, id: res.session.pitcherTokenID });
        }
        if (res.session.batterAddress !== ZERO_ADDRESS) {
          tokens.push({ address: res.session.batterAddress, id: res.session.batterTokenID });
        }
      });

      const tokenQueries: any[] = [];
      await tokens.forEach((token) => {
        tokenContract.options.address = token.address;
        tokenQueries.push({
          target: token.address,
          callData: tokenContract.methods.tokenURI(token.id).encodeABI(),
        });
        tokenQueries.push({
          target: gameContract.options.address,
          callData: gameContract.methods.Staker(token.address, token.id).encodeABI(),
        });
      });

      const tokenRes = await multicallContract.methods.tryAggregate(false, tokenQueries).call();

      const tokensParsed = tokens.map((token, idx) => {
        const tokenMetadata = decodeBase64Json(web3ctx.web3.utils.hexToUtf8(tokenRes[idx * 2][1]));
        const adr = "0x" + tokenRes[idx * 2 + 1][1].slice(-40);
        const staker = web3ctx.web3.utils.toChecksumAddress(adr);
        return {
          ...token,
          image: tokenMetadata.image,
          name: tokenMetadata.name,
          staker,
        };
      });

      const sessionsWithTokens = decodedRes.map((res, idx) => {
        const pair: { pitcher: Token | undefined; batter: Token | undefined } = {
          pitcher: tokensParsed.find(
            (token) =>
              token.address === res.session.pitcherAddress &&
              token.id === res.session.pitcherTokenID,
          ),
          batter: tokensParsed.find(
            (token) =>
              token.address === res.session.batterAddress && token.id === res.session.batterTokenID,
          ),
        };
        return {
          pair,
          progress: res.progress,
          sessionID: idx + 1,
          phaseStartTimestamp: Number(res.session.phaseStartTimestamp),
          secondsPerPhase,
        };
      });
      return sessionsWithTokens.reverse();
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
        <MySessions
          sessions={mySessions(sessions.data)}
          onClick={(session: Session) => joinSession.mutate(session.sessionID)}
        />
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
