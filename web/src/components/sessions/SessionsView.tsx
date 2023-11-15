import { useGameContext } from "../../contexts/GameContext";
import { Box, Flex, Text } from "@chakra-ui/react";
import styles from "./SessionsView.module.css";
import globalStyles from "../tokens/OwnedTokens.module.css";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useContext, useEffect } from "react";
import Web3Context from "../../contexts/Web3Context/context";
import useMoonToast from "../../hooks/useMoonToast";
import { decodeBase64Json } from "../../utils/decoders";
import CharacterCard from "../tokens/CharacterCard";
import { Session, Token } from "../../types";
import OwnedTokens from "../tokens/OwnedTokens";
import StakedTokens from "../tokens/StakedTokens";
import { MULTICALL2_CONTRACT_ADDRESSES } from "../../constants";
import { outputs } from "../../web3/abi/ABIITems";
import SessionView3 from "./SessionView3";
import FiltersView2 from "./FiltersView2";
import { useRouter } from "next/router";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../../web3/abi/FullcountABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../../web3/abi/BLBABI.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const multicallABI = require("../../web3/abi/Multicall2.json");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const SessionsView = () => {
  const { selectedToken, updateContext, tokenAddress, contractAddress, progressFilter } =
    useGameContext();
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

  const router = useRouter();

  useEffect(() => {
    if (router.query.invite) {
      updateContext({ invited: !!router.query.invite });
    }
    if (router.query.session) {
      updateContext({
        selectedSession: sessions.data?.find((s) => s.sessionID === Number(router.query.session)),
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.invite, router.query.session]);

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
      console.log("FETCHING SESSIONS");

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
      tokens.forEach((token) => {
        tokenContract.options.address = token.address;
        tokenQueries.push({
          target: token.address,
          callData: tokenContract.methods.tokenURI(token.id).encodeABI(),
        });
        tokenQueries.push({
          target: tokenContract.options.address,
          callData: tokenContract.methods.ownerOf(token.id).encodeABI(),
        });
      });

      const tokenRes = await multicallContract.methods.tryAggregate(false, tokenQueries).call();

      const tokensParsed = tokens.map((token, idx) => {
        const tokenMetadata = decodeBase64Json(web3ctx.web3.utils.hexToAscii(tokenRes[idx * 2][1]));

        const adr = "0x" + tokenRes[idx * 2 + 1][1].slice(-40);
        const staker = web3ctx.web3.utils.toChecksumAddress(adr);
        return {
          ...token,
          image: tokenMetadata.image,
          name: tokenMetadata.name,
          staker,
        };
      });

      const sessionsWithTokens = decodedRes.map((session, idx) => {
        const pair: { pitcher: Token | undefined; batter: Token | undefined } = {
          pitcher: tokensParsed.find(
            (token) =>
              token.address === session.session.pitcherAddress &&
              token.id === session.session.pitcherTokenID,
          ),
          batter: tokensParsed.find(
            (token) =>
              token.address === session.session.batterAddress &&
              token.id === session.session.batterTokenID,
          ),
        };

        return {
          pair,
          sessionID: idx + 1,
          phaseStartTimestamp: Number(session.session.phaseStartTimestamp),
          secondsPerPhase,
          progress: session.progress,
        };
      });
      console.log(sessionsWithTokens);
      return sessionsWithTokens.reverse();
    },
    {
      onSuccess: (data) => {
        updateContext({ sessions: data });
      },
      // ...queryCacheProps,
      refetchInterval: 15 * 1000,
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

  const activeSessions = (sessions: any[]) => {
    return sessions.filter((session) => session.progress === 2);
  };

  const liveSessions = (sessions: any[]) => {
    return sessions.filter((session) => session.progress === 3 || session.progress === 4);
  };

  const otherSessions = (sessions: any[]) => {
    return sessions.filter(
      (session) => session.progress !== 3 && session.progress !== 4 && session.progress !== 2,
    );
  };

  const isTokenStaked = (token: Token) => {
    return sessions.data?.find(
      (s) =>
        (s.pair.pitcher?.id === token.id && s.pair.pitcher?.address === token.address) ||
        (s.pair.batter?.id === token.id && s.pair.batter?.address === token.address),
    );
  };

  const filters = [
    {
      label: "Active",
      progress: [2],
    },
    { lable: "Live", progress: [3, 4] },
    { label: "Other", progress: [0, 1, 5, 6] },
  ];
  return (
    <Flex className={styles.container}>
      <Flex gap={"30px"}>
        <OwnedTokens />
        <StakedTokens />
      </Flex>
      {selectedToken && !isTokenStaked(selectedToken) && (
        <CharacterCard token={selectedToken} isActive={false} placeSelf={"start"} />
      )}

      <Flex gap={"20px"} w={"100%"} justifyContent={"space-between"}>
        <Text className={styles.title}>Sessions</Text>
        {selectedToken && !isTokenStaked(selectedToken) && (
          <Flex gap={"20px"}>
            <button className={globalStyles.button} onClick={() => startSession.mutate(0)}>
              Start new session as pitcher
            </button>
            <button className={globalStyles.button} onClick={() => startSession.mutate(1)}>
              Start new session as batter
            </button>
          </Flex>
        )}
      </Flex>
      <FiltersView2 />
      {sessions.data && (
        <Flex direction={"column"} gap={"10px"} w={"100%"}>
          {sessions.data.map((session, idx) => (
            <>
              {progressFilter[session.progress] && (
                <>
                  <SessionView3 key={idx} session={session} />
                  {idx + 1 < sessions.data.length && <Box w={"100%"} h={"0.5px"} bg={"#BFBFBF"} />}
                </>
              )}
            </>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default SessionsView;
