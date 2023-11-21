import { useGameContext } from "../../contexts/GameContext";
import { Box, Flex, Spinner, Text, useDisclosure } from "@chakra-ui/react";
import styles from "./SessionsView.module.css";
import globalStyles from "../tokens/OwnedTokens.module.css";
import { useMutation, useQuery, useQueryClient } from "react-query";
import React, { Fragment, useContext, useEffect, useState } from "react";
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
import InviteView from "./InviteView";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];
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
  const multicallContract = new web3ctx.web3.eth.Contract(
    multicallABI,
    MULTICALL2_CONTRACT_ADDRESS,
  );

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const [sessionInviteTo, setSessionInviteTo] = useState<Session | undefined>(undefined);

  useEffect(() => {
    if (router.query.invitedBy && router.query.session) {
      const invitedBy = Array.isArray(router.query.invitedBy)
        ? router.query.invitedBy[0]
        : router.query.invitedBy;
      const invitedTo = Number(
        Array.isArray(router.query.session) ? router.query.session[0] : router.query.session,
      );
      updateContext({ invitedBy, invitedTo });
      router.push("/", undefined, { shallow: true });
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.invite, router.query.session]);

  const queryClient = useQueryClient();
  const toast = useMoonToast();

  const sessions = useQuery<Session[]>(
    ["sessions"],
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
      // const session = await gameContract.methods.getSession(1).call();

      const res = [];
      for (let i = 0; i < multicallRes.length; i += 2) {
        res.push({ progress: multicallRes[i][1], session: multicallRes[i + 1][1] });
      }
      const decodedRes = res.map((data: any) => {
        const sessionRaw = web3ctx.web3.eth.abi.decodeParameters(outputs, data.session)[0];
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
          name: tokenMetadata.name.split(` - ${token.id}`)[0],
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
          batterLeft: session.session.batterLeftSession,
          pitcherLeft: session.session.pitcherLeftSession,
          sessionID: idx + 1,
          phaseStartTimestamp: Number(session.session.phaseStartTimestamp),
          secondsPerPhase,
          progress: session.progress,
        };
      });
      return sessionsWithTokens.reverse();
    },
    {
      onSuccess: (data) => {
        updateContext({ sessions: data });
      },
      // ...queryCacheProps,
      refetchInterval: 5 * 1000,
    },
  );

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
      <Flex gap={"20px"} alignItems={"start"}>
        <InviteView isOpen={isOpen} onClose={onClose} />
        <Flex gap={"30px"}>
          <OwnedTokens />
          {/*<StakedTokens />*/}
        </Flex>
      </Flex>

      <Flex gap={"20px"} w={"100%"} justifyContent={"space-between"}>
        <Text className={styles.title}>Sessions</Text>
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
