import { useRouter } from "next/router";
import React, { Fragment, useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { getTokenMetadata } from "../../utils/decoders";

import { useGameContext } from "../../contexts/GameContext";
import Web3Context from "../../contexts/Web3Context/context";

import SessionView3 from "./SessionView3";
import FiltersView2 from "./FiltersView2";
import InviteView from "./InviteView";
import OwnedTokens from "../tokens/OwnedTokens";

import styles from "./SessionsView.module.css";
import { FullcountContractSession, Session, Token } from "../../types";

import { outputs } from "../../web3/abi/ABIITems";
import { AbiItem } from "web3-utils";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import TokenABIImported from "../../web3/abi/BLBABI.json";
import MulticallABIImported from "../../web3/abi/Multicall2.json";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];
const TokenABI = TokenABIImported as unknown as AbiItem[];
const MulticallABI = MulticallABIImported as unknown as AbiItem[];
import { MULTICALL2_CONTRACT_ADDRESSES } from "../../constants";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const SessionsView = () => {
  const {
    updateContext,
    tokenAddress,
    contractAddress,
    progressFilter,
    tokensCache,
    sessionOffset,
  } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI);
  gameContract.options.address = contractAddress;
  const tokenContract = new web3ctx.web3.eth.Contract(TokenABI);
  tokenContract.options.address = tokenAddress;
  const MULTICALL2_CONTRACT_ADDRESS =
    MULTICALL2_CONTRACT_ADDRESSES[
      String(web3ctx.chainId) as keyof typeof MULTICALL2_CONTRACT_ADDRESSES
    ];
  const multicallContract = new web3ctx.web3.eth.Contract(
    MulticallABI,
    MULTICALL2_CONTRACT_ADDRESS,
  );

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (router.query.invitedBy && router.query.session) {
      const invitedBy = Array.isArray(router.query.invitedBy)
        ? router.query.invitedBy[0]
        : router.query.invitedBy;
      const inviteCode = Array.isArray(router.query.inviteCode)
        ? router.query.inviteCode[0]
        : router.query.inviteCode;
      const invitedTo = Number(
        Array.isArray(router.query.session) ? router.query.session[0] : router.query.session,
      );
      updateContext({ invitedBy, invitedTo, inviteCode });
      router.push("/", undefined, { shallow: true });
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.invite, router.query.session]);

  const sessions = useQuery<Session[]>(
    ["sessions"],
    async () => {
      console.log("FETCHING SESSIONS");

      const numSessions = await gameContract.methods.NumSessions().call();
      const secondsPerPhase = Number(await gameContract.methods.SecondsPerPhase().call());
      const target = contractAddress;
      const callData: string[] = [];
      const oldestSessionNumber = Math.max(numSessions - sessionOffset, 1);
      for (let i = oldestSessionNumber; i <= numSessions; i += 1) {
        callData.push(gameContract.methods.sessionProgress(i).encodeABI());
        callData.push(gameContract.methods.getSession(i).encodeABI());
      }
      const queries = callData.map((callData) => {
        return {
          target,
          callData,
        };
      });

      const multicallRes = await multicallContract.methods.tryAggregate(false, queries).call();

      const res: { progress: string; session: string }[] = [];
      for (let i = 0; i < multicallRes.length; i += 2) {
        res.push({ progress: multicallRes[i][1], session: multicallRes[i + 1][1] });
      }
      const decodedRes = res.map((data) => {
        const sessionRaw = web3ctx.web3.eth.abi.decodeParameters(
          outputs,
          data.session,
        )[0] as FullcountContractSession;
        const session = {
          ...sessionRaw,
          pitcherAddress: sessionRaw.pitcherNFT.nftAddress,
          pitcherTokenID: sessionRaw.pitcherNFT.tokenID,
          batterAddress: sessionRaw.batterNFT.nftAddress,
          batterTokenID: sessionRaw.batterNFT.tokenID,
        };
        return {
          progress: Number(data.progress),
          session,
        };
      });
      const tokens: { address: string; id: string }[] = [];
      decodedRes.forEach((res) => {
        if (
          res.session.pitcherAddress !== ZERO_ADDRESS &&
          !tokens.some(
            (t) => t.address === res.session.pitcherAddress && t.id === res.session.pitcherTokenID,
          ) &&
          !tokensCache.some(
            (t) => t.address === res.session.pitcherAddress && t.id === res.session.pitcherTokenID,
          )
        ) {
          tokens.push({ address: res.session.pitcherAddress, id: res.session.pitcherTokenID });
        }
        if (
          res.session.batterAddress !== ZERO_ADDRESS &&
          !tokens.some(
            (t) => t.address === res.session.batterAddress && t.id === res.session.batterTokenID,
          ) &&
          !tokensCache.some(
            (t) => t.address === res.session.batterAddress && t.id === res.session.batterTokenID,
          )
        ) {
          tokens.push({ address: res.session.batterAddress, id: res.session.batterTokenID });
        }
      });

      const tokenQueries: { target: string; callData: string }[] = [];
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

      const tokensParsed: Token[] = await Promise.all(
        tokens.map(async (token, idx) => {
          const uri = web3ctx.web3.utils.hexToAscii(tokenRes[idx * 2][1]);
          const tokenMetadata = await getTokenMetadata(uri);

          const adr = "0x" + tokenRes[idx * 2 + 1][1].slice(-40);
          const staker = web3ctx.web3.utils.toChecksumAddress(adr);
          return {
            ...token,
            image: tokenMetadata.image,
            name: tokenMetadata.name.split(` - ${token.id}`)[0],
            staker,
          };
        }),
      );

      const tokensFromChainAndCache = tokensParsed.concat(tokensCache);
      updateContext({ tokensCache: tokensFromChainAndCache });

      const sessionsWithTokens = decodedRes.map((session, idx) => {
        const pair: { pitcher: Token | undefined; batter: Token | undefined } = {
          pitcher: tokensFromChainAndCache.find(
            (token) =>
              token.address === session.session.pitcherAddress &&
              token.id === session.session.pitcherTokenID,
          ),
          batter: tokensFromChainAndCache.find(
            (token) =>
              token.address === session.session.batterAddress &&
              token.id === session.session.batterTokenID,
          ),
        };

        return {
          pair,
          batterLeftSession: session.session.batterLeftSession,
          pitcherLeftSession: session.session.pitcherLeftSession,
          sessionID: oldestSessionNumber + idx,
          phaseStartTimestamp: Number(session.session.phaseStartTimestamp),
          secondsPerPhase,
          progress: session.progress,
          didPitcherCommit: session.session.didPitcherCommit,
          didPitcherReveal: session.session.didPitcherReveal,
          didBatterCommit: session.session.didBatterCommit,
          didBatterReveal: session.session.didBatterReveal,
          outcome: Number(session.session.outcome),
        };
      });

      return sessionsWithTokens
        .filter(
          (s) =>
            (s.progress !== 6 && s.progress !== 1) ||
            s.pair.batter?.staker === web3ctx.account ||
            s.pair.pitcher?.staker === web3ctx.account,
        )
        .reverse();
    },
    {
      onSuccess: (data) => {
        updateContext({ sessions: data });
      },
      refetchInterval: 5 * 1000,
    },
  );

  return (
    <Flex className={styles.container}>
      <Flex gap={"20px"} alignItems={"start"}>
        <InviteView isOpen={isOpen} onClose={onClose} />
        <Flex gap={"30px"}>
          <OwnedTokens />
        </Flex>
      </Flex>

      <FiltersView2 />
      {sessions.data && (
        <Flex direction={"column"} gap={"10px"} w={"100%"}>
          {sessions.data.map((session, idx) => (
            <Fragment key={idx}>
              {progressFilter[session.progress] && (
                <>
                  <SessionView3 session={session} />
                  {idx + 1 < sessions.data.length && <Box w={"100%"} h={"0.5px"} bg={"#BFBFBF"} />}
                </>
              )}
            </Fragment>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default SessionsView;
