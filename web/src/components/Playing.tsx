import { Image } from "@chakra-ui/react";

import { useGameContext } from "../contexts/GameContext";
import SessionsView from "./sessions/SessionsView";
import PlayView from "./playing/PlayView";
import styles from "./Playing.module.css";
import { useQuery } from "react-query";
import { AtBat, OwnedToken } from "../types";
import { fetchFullcountPlayerTokens } from "../tokenInterfaces/FullcountPlayerAPI";
import queryCacheProps from "../hooks/hookCommon";
import useUser from "../contexts/UserContext";
import CreateCharacterForm from "./tokens/CreateCharacterForm";
import PlayingLayout from "./layout/PlayingLayout";
import ChooseToken from "./tokens/ChooseToken";
import HomePage from "./HomePage/HomePage";
import { getAtBats } from "../services/fullcounts";
import React, { useEffect, useState } from "react";
import { FULLCOUNT_ASSETS_PATH } from "../constants";
import { getContracts } from "../utils/getWeb3Contracts";
import { getMulticallResults } from "../utils/multicall";

import { AbiItem } from "web3-utils";
import FullcountABIImported from "../web3/abi/FullcountABI.json";
import { useSound } from "../hooks/useSound";
import { useRouter } from "next/router";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const Playing = () => {
  const {
    selectedSession,
    selectedToken,
    selectedTokenIdx,
    watchingToken,
    updateContext,
    invitedTo,
    isCreateCharacter,
    tokensCache,
    joinedNotification,
  } = useGameContext();
  const { user } = useUser();
  const playSound = useSound();
  const [inviteFrom, setInviteFrom] = useState("");
  const [inviteSession, setInviteSession] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (router.query.invite_from && typeof router.query.invite_from === "string") {
      setInviteFrom(router.query.invite_from);
    } else {
      setInviteFrom("");
    }
    if (router.query.id && typeof router.query.id === "string") {
      setInviteSession(router.query.id);
    } else {
      setInviteSession("");
    }
    if (router.query.invite_code && typeof router.query.invite_code === "string") {
      setInviteCode(router.query.invite_code);
    } else {
      setInviteCode("");
    }
  }, [router.query.invite_from, router.query.id, router.query.invite_code]);

  const ownedTokens = useQuery<OwnedToken[]>(
    ["owned_tokens", user],
    async () => {
      const ownedTokens = user ? await fetchFullcountPlayerTokens() : [];
      if (ownedTokens.length > 0 && !selectedToken && ownedTokens[selectedTokenIdx]) {
        updateContext({ selectedToken: { ...ownedTokens[selectedTokenIdx] } });
      }
      //first response  from the FCPLayer API after token creation has empty name and p0 image
      if (
        selectedToken &&
        !selectedToken.name &&
        ownedTokens[selectedTokenIdx] &&
        selectedToken.id === ownedTokens[selectedTokenIdx].id
      ) {
        updateContext({ selectedToken: { ...ownedTokens[selectedTokenIdx] } });
      }
      return ownedTokens;
    },
    {
      ...queryCacheProps,
      refetchInterval: 5000,
    },
  );

  const tokenStatuses = useQuery(
    ["token_statuses", ownedTokens.data, joinedNotification],
    async () => {
      if (!ownedTokens.data || ownedTokens.data.length < 1 || !joinedNotification) {
        return;
      }
      const { gameContract } = getContracts();
      const queries: { target: string; callData: string }[] = [];
      ownedTokens.data.forEach((ownedToken) => {
        queries.push({
          target: gameContract.options.address,
          callData: gameContract.methods
            .StakedSession(ownedToken.address, ownedToken.id)
            .encodeABI(),
        });
        let stakedSession;
        if (tokenStatuses.data) {
          stakedSession = tokenStatuses.data.find(
            (t) => t.address === ownedToken.address && t.id === ownedToken.id,
          )?.stakedSessionID;
        }
        queries.push({
          target: gameContract.options.address,
          callData: gameContract.methods.sessionProgress(stakedSession ?? 0).encodeABI(),
        });
      });

      const [stakedSessions, progresses] = await getMulticallResults(
        FullcountABI,
        ["StakedSession", "sessionProgress"],
        queries,
      );
      const result = ownedTokens.data.map((t, idx) => ({
        ...t,
        stakedSession: stakedSessions[idx],
        progress: progresses[idx],
      }));
      if (
        tokenStatuses.data &&
        tokenStatuses.data.some(
          (ts) =>
            ts.progress === "2" &&
            result.some((t) => t.address === ts.address && t.id === ts.id && t.progress === "3"),
        )
      ) {
        playSound("stadium");
      }

      return result;
    },
    {
      enabled: !!ownedTokens.data && joinedNotification,
      refetchIntervalInBackground: true,
      refetchInterval: 10000,
    },
  );

  const atBats = useQuery(
    ["atBats"],
    async () => {
      return getAtBats({ tokensCache });
    },
    {
      refetchInterval: 5000,
      onSuccess: (data: any) => {
        if (data.tokens.length !== tokensCache.length) {
          updateContext({ tokensCache: [...data.tokens] });
        }
      },
    },
  );

  if (!atBats.data || !ownedTokens.data) {
    return (
      <div className={styles.loadingViewContainer}>
        <Image
          alt={""}
          minW={"552px"}
          h={"123px"}
          position={"absolute"}
          src={`${FULLCOUNT_ASSETS_PATH}/stadium.png`}
          right={"50%"}
          bottom={"75%"}
          transform={"translateX(50%) translateY(50%)"}
          filter={"blur(0px)"}
        />
        <Image
          src={`${FULLCOUNT_ASSETS_PATH}/logo-4-no-stroke.png`}
          position={"absolute"}
          top={"10%"}
          right={"50%"}
          w={"158px"}
          transform={"translateX(50%) translateY(-40px)"}
          alt={""}
          h={"84px"}
          zIndex={"0"}
        />
        <Image
          src={`${FULLCOUNT_ASSETS_PATH}/batter.png`}
          position={"absolute"}
          bottom={"0"}
          right={"50%"}
          minW={"165px"}
          transform={"translateX(0) translateY(-40px)"}
          alt={""}
          h={"395px"}
          zIndex={"0"}
        />
        <Image
          src={`${FULLCOUNT_ASSETS_PATH}/pitcher.png`}
          position={"absolute"}
          bottom={"65%"}
          right={"50%"}
          transform={"translateX(50%) translateY(100%)"}
          alt={""}
          w={"60px"}
          h={"80px"}
          zIndex={"0"}
        />
      </div>
    );
  }

  return (
    <>
      {isCreateCharacter && (
        <CreateCharacterForm onClose={() => updateContext({ isCreateCharacter: false })} />
      )}

      {ownedTokens.data && ownedTokens.data.length < 1 && !ownedTokens.error && (
        <CreateCharacterForm />
      )}

      {!selectedSession &&
        ownedTokens.data &&
        ownedTokens.data.length >= 1 &&
        !invitedTo &&
        !inviteFrom &&
        !isCreateCharacter && (
          <PlayingLayout>
            <HomePage tokens={ownedTokens.data} atBats={atBats.data?.atBats} />
          </PlayingLayout>
        )}
      {inviteFrom && inviteSession && ownedTokens.data && ownedTokens.data.length > 0 && (
        <ChooseToken
          tokens={ownedTokens.data.filter((t) => !t.isStaked || t.tokenProgress === 6)}
          sessionID={Number(inviteSession)}
          inviteCode={inviteCode}
          inviteFrom={inviteFrom}
          onClose={() => {
            router.push("/");
            setInviteCode("");
            setInviteFrom("");
            setInviteSession("");
          }}
        />
      )}
    </>
  );
};

export default Playing;
