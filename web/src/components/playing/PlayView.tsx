import { useGameContext } from "../../contexts/GameContext";
import { Flex, Image, useMediaQuery, Text } from "@chakra-ui/react";
import Timer from "./Timer";
import { useQuery, useQueryClient } from "react-query";
import { useContext, useEffect, useState } from "react";
import Web3Context from "../../contexts/Web3Context/context";
import { OwnedToken, Token } from "../../types";
import Outcome from "./Outcome";
import InviteLink from "./InviteLink";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import TokenABIImported from "../../web3/abi/BLBABI.json";
import { AbiItem } from "web3-utils";
import { FULLCOUNT_ASSETS_PATH, ZERO_ADDRESS } from "../../constants";
import { getTokenMetadata } from "../../utils/decoders";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../../web3/abi/BLBABI.json");
import TokenView from "../tokens/TokenView";
import PitcherViewMobile from "./PitcherViewMobile";
import BatterViewMobile from "./BatterViewMobile";
import styles from "./PlayView.module.css";
import { getMulticallResults } from "../../utils/multicall";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];
const TokenABI = TokenABIImported as unknown as AbiItem[];

export function getRowCol(index: number): [number, number] {
  const size = 5; // Size of the grid (5x5)
  const row = Math.floor(index / size);
  const col = index % size;
  return [row, col]; // 0-based index for row and column
}

export interface SessionStatus {
  progress: number;
  didPitcherCommit: boolean;
  didBatterCommit: boolean;
  didPitcherReveal: boolean;
  didBatterReveal: boolean;
  outcome: number;
  sessionID: number;
}

export const horizontalLocations = {
  0: "Inside Ball",
  1: "Inside Strike",
  2: "Middle",
  3: "Outside Strike",
  4: "Outside Ball",
};

export const verticalLocations = {
  0: "High Ball",
  1: "High Strike",
  2: "Middle",
  3: "Low Strike",
  4: "Low Ball",
};

export const pitchSpeed = {
  0: "Fast",
  1: "Slow",
};

export const swingKind = {
  0: "Contact",
  1: "Power",
  2: "Take",
};

const PlayView = ({ selectedToken }: { selectedToken: Token }) => {
  const [sessionID, setSessionID] = useState(undefined);
  const [isShowOutcomeDone, setIsShowOutcomeDone] = useState(false);
  const [isSmallView] = useMediaQuery("(max-width: 1023px)");

  const {
    tokensCache,
    secondsPerPhase,
    selectedAtBat,
    selectedSession,
    updateContext,
    contractAddress,
  } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  const isPitcher = (token?: Token) =>
    selectedSession?.pair.pitcher?.id === token?.id &&
    selectedSession?.pair.pitcher?.address === token?.address;
  const [opponent, setOpponent] = useState<Token | undefined>(undefined);
  const [gameOver, setGameOver] = useState(false);

  const [pitcher, setPitcher] = useState<Token | undefined>(undefined);
  const [batter, setBatter] = useState<Token | undefined>(undefined);

  const atBat = useQuery(
    ["sessionAtBatID", selectedSession],
    () => {
      console.log("sessionAtBatID");
      if (!selectedSession) return undefined;
      return gameContract.methods.SessionAtBat(selectedSession.sessionID).call();
    },
    {
      refetchInterval: 100000000,
      onSuccess: (data) => {
        console.log("sessionAtBatID success: ", data);
      },
    },
  );

  const queryClient = useQueryClient();

  const atBatStatus = useQuery(
    ["atBatStatus", atBat.data?.progress],
    async () => {
      if (!atBat.data) {
        console.log("!atBat.data");
        return;
      }
      console.log("atBatStatus", atBat.data);

      const atBatID = atBat.data;
      const status = await gameContract.methods.getAtBat(atBatID).call();
      const numSessions = Number(
        await gameContract.methods.getNumberOfSessionsInAtBat(atBatID).call(),
      );
      const currentSessionID = await gameContract.methods
        .AtBatSessions(atBatID, numSessions - 1)
        .call();
      console.log({
        atBat: {
          ...status,
          currentSessionID,
          numSessions,
        },
      });
      if (Number(status.outcome) !== 0) {
        queryClient.refetchQueries("owned_tokens");
      }
      return {
        ...status,
        currentSessionID,
        numSessions,
      };
    },
    {
      enabled: false,
      onSuccess: (data) => {
        console.log("atBatStatus success: ", data);
      },
    },
  );

  const sessionStatus = useQuery(
    ["session", selectedSession, atBatStatus.data, sessionID],
    async () => {
      console.log("sessionStatus");
      if (!selectedSession) return undefined;
      const id = sessionID ?? selectedSession.sessionID;
      if (!secondsPerPhase) {
        const secondsPerPhaseRes = Number(await gameContract.methods.SecondsPerPhase().call());
        updateContext({ secondsPerPhase: secondsPerPhaseRes });
      }
      const queries = [
        {
          target: gameContract.options.address,
          callData: gameContract.methods.sessionProgress(id).encodeABI(),
        },
        {
          target: gameContract.options.address,
          callData: gameContract.methods.getSession(id).encodeABI(),
        },
      ];
      const [progresses, sessions] = await getMulticallResults(
        FullcountABI,
        ["sessionProgress", "getSession"],
        queries,
      );
      const progress = Number(progresses[0]);
      const session = sessions[0];

      if (progress < 2 || progress > 4) {
        setGameOver(true);
      } else {
        setGameOver(false);
      }

      const pitcherAddress = session.pitcherNFT.nftAddress;
      const pitcherTokenID = session.pitcherNFT.tokenID;
      const batterAddress = session.batterNFT.nftAddress;
      const batterTokenID = session.batterNFT.tokenID;
      const isPitcherNFTSelected =
        selectedToken.address === session.pitcherNFT.nftAddress &&
        selectedToken.id === session.pitcherNFT.tokenID;
      const isBatterNFTSelected =
        selectedToken.address === session.batterNFT.nftAddress &&
        selectedToken.id === session.batterNFT.tokenID;

      const isSelectedTokenInSession = isPitcherNFTSelected || isBatterNFTSelected;

      const otherToken =
        batterAddress === selectedToken.address && batterTokenID === selectedToken.id
          ? { address: pitcherAddress, id: pitcherTokenID }
          : { address: batterAddress, id: batterTokenID };
      if (otherToken.address !== ZERO_ADDRESS && !(otherToken.address === opponent?.address)) {
        const tokenFromCache = tokensCache.find(
          (token) => token.address === otherToken.address && token.id === otherToken.id,
        );
        if (!tokenFromCache) {
          tokenContract.options.address = otherToken.address;
          const URI = await tokenContract.methods.tokenURI(otherToken.id).call();
          const tokenMetadata = await getTokenMetadata(URI);
          setOpponent({
            ...otherToken,
            staker: "0x",
            image: tokenMetadata.image,
            name: tokenMetadata.name.split(` - ${otherToken.id}`)[0],
          });
        } else {
          setOpponent({ ...tokenFromCache });
        }
      }

      const {
        didPitcherCommit,
        didBatterCommit,
        didPitcherReveal,
        didBatterReveal,
        outcome,
        phaseStartTimestamp,
        pitcherReveal,
        batterReveal,
        pitcherLeftSession,
        batterLeftSession,
      } = session;

      let isExpired = progress === 6;
      if (progress === 3 || progress === 4) {
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        const endTime = Number(phaseStartTimestamp) + (secondsPerPhase ?? 0);
        const remainingTime = endTime - currentTime;
        if (remainingTime < 1) {
          isExpired = true;
        }
      }
      const speed: 0 | 1 = Number(pitcherReveal[1]) === 0 ? 0 : 1;
      const kind: 0 | 1 | 2 =
        Number(batterReveal[1]) === 0 ? 0 : Number(batterReveal[1]) === 1 ? 1 : 2;

      return {
        sessionID: Number(id),
        progress,
        didPitcherCommit,
        didBatterCommit,
        didPitcherReveal,
        didBatterReveal,
        pitcherLeftSession,
        batterLeftSession,
        outcome,
        phaseStartTimestamp: Number(phaseStartTimestamp),
        isExpired,
        pitcherReveal: {
          speed,
          vertical: Number(pitcherReveal[2]),
          horizontal: Number(pitcherReveal[3]),
        },
        batterReveal: {
          kind,
          vertical: Number(batterReveal[2]),
          horizontal: Number(batterReveal[3]),
        },
        isSelectedTokenInSession,
      };
    },

    {
      onSuccess: (data) => {
        console.log("sessionStatus success: ", data);
      },
      refetchInterval: 3000,
      retry: false,
    },
  );

  useEffect(() => {
    setPitcher(isPitcher(selectedToken) ? selectedToken : opponent);
    setBatter(isPitcher(selectedToken) ? opponent : selectedToken);
  }, [selectedToken, opponent]);

  useEffect(() => {
    console.log("sessionStatus.data useEffect:", sessionStatus.data?.progress);
    if (sessionStatus.data) {
      atBatStatus.refetch();
    }
  }, [sessionStatus.data?.progress]);

  useEffect(() => {
    console.log(
      "atBatStatus.data, isShowOutcomeDone useEffect: ",
      atBatStatus.data,
      isShowOutcomeDone,
      "sessionID: ",
      sessionID,
    );
    if (isShowOutcomeDone && atBatStatus.data?.currentSessionID) {
      if (Number(atBatStatus.data.currentSessionID) !== sessionStatus.data?.sessionID) {
        setSessionID(atBatStatus.data.currentSessionID);
        setIsShowOutcomeDone(false);
      }
    }
  }, [atBatStatus.data, isShowOutcomeDone]);

  const numberToOrdinal = (n: number): string => {
    if (n > 10) return "";
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    return `${n}th`;
  };

  return (
    <Flex direction={"column"} gap={"20px"} minW={"100%"}>
      {isSmallView && (
        <Flex w={"100%"} justifyContent={"end"}>
          <Image
            alt="exit"
            src={`${FULLCOUNT_ASSETS_PATH}/icons/exit.svg`}
            h={"20px"}
            w={"20px"}
            cursor={"pointer"}
            onClick={() => updateContext({ selectedSession: undefined, watchingToken: undefined })}
          />
        </Flex>
      )}
      <Flex justifyContent={"space-between"} minW={"100%"} alignItems={"center"}>
        {!isSmallView && <Flex w={"20px"} h={"10px"} />}

        {!isSmallView && (
          <Flex w={"20px"} justifyContent={"end"}>
            <Image
              alt="exit"
              src={`${FULLCOUNT_ASSETS_PATH}/icons/exit.svg`}
              h={"20px"}
              w={"20px"}
              cursor={"pointer"}
              onClick={() =>
                updateContext({ selectedSession: undefined, watchingToken: undefined })
              }
            />
          </Flex>
        )}
      </Flex>

      {isSmallView && (
        <Flex alignItems={"center"} justifyContent={"space-between"} gap={"10px"}>
          <TokenView
            token={pitcher}
            width={isPitcher(selectedToken) ? "300px" : "100px"}
            isPitcher={true}
          />
          vs
          <TokenView
            token={batter}
            width={!isPitcher(selectedToken) ? "300px" : "100px"}
            isPitcher={false}
          />
        </Flex>
      )}

      {/*{atBatStatus.data && (*/}
      {/*  <Text fontSize={"20px"} mx={"auto"}>{`${numberToOrdinal(*/}
      {/*    atBatStatus.data.numSessions,*/}
      {/*  )} pitch`}</Text>*/}
      {/*)}*/}
      <Flex alignItems={"center"} justifyContent={"space-between"} gap={"10px"} w={"100%"}>
        {!isSmallView && (
          <TokenView
            token={pitcher}
            width={isPitcher(selectedToken) ? "300px" : "150px"}
            isPitcher={true}
          />
        )}
        {sessionStatus.data?.progress === 2 &&
          selectedSession &&
          selectedToken &&
          sessionStatus.data?.isSelectedTokenInSession && (
            <InviteLink session={selectedSession} token={selectedToken} />
          )}
        {(sessionStatus.data?.progress === 3 || sessionStatus.data?.progress === 4) &&
          !sessionStatus.data?.isExpired && (
            <Flex direction={"column"} gap={"30px"} alignItems={"center"} mx={"auto"}>
              {atBatStatus.data && (
                <Text className={styles.pitchTitle}>Pitch {atBatStatus.data.numSessions}</Text>
              )}
              <Timer
                balls={atBatStatus.data?.balls ?? 3}
                strikes={atBatStatus.data?.strikes ?? 2}
                start={Number(sessionStatus.data?.phaseStartTimestamp)}
                delay={secondsPerPhase ?? 120}
                isActive={
                  sessionStatus.data?.progress === 3 ||
                  sessionStatus.data?.progress === 4 ||
                  sessionStatus.data?.progress === 5
                }
              />
              {isPitcher(selectedToken) && sessionStatus.data && (
                <>
                  <PitcherViewMobile
                    sessionStatus={sessionStatus.data}
                    token={selectedToken as OwnedToken}
                  />
                </>
              )}
              {!isPitcher(selectedToken) && sessionStatus.data && (
                <BatterViewMobile
                  sessionStatus={sessionStatus.data}
                  token={selectedToken as OwnedToken} //TODO something. selectedToken can be Token (when view), but for actions OwnedToken needed
                />
              )}
            </Flex>
          )}
        {sessionStatus.data &&
          sessionStatus.data.progress === 5 &&
          sessionStatus.data.didBatterReveal &&
          sessionStatus.data.didPitcherReveal && (
            <Outcome
              outcome={sessionStatus.data?.outcome}
              pitch={sessionStatus.data.pitcherReveal}
              swing={sessionStatus.data.batterReveal}
              onDone={() => setIsShowOutcomeDone(true)}
              atBatOutcome={atBatStatus.data?.outcome ?? 0}
            />
          )}
        {!isSmallView && (
          <TokenView
            token={batter}
            width={!isPitcher(selectedToken) ? "300px" : "150px"}
            isPitcher={false}
          />
        )}
      </Flex>
    </Flex>
  );
};
export default PlayView;
