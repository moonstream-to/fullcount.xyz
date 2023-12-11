import { useGameContext } from "../../contexts/GameContext";
import PitcherView from "./PitcherView";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import Timer from "./Timer";
import { useQuery } from "react-query";
import { useContext, useEffect, useState } from "react";
import Web3Context from "../../contexts/Web3Context/context";
import { PitchLocation, SwingLocation, Token } from "../../types";
import { CloseIcon } from "@chakra-ui/icons";
import Outcome from "./Outcome";
import BatterView2 from "./BatterView2";
import InviteLink from "./InviteLink";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import { FULLCOUNT_ASSETS_PATH, ZERO_ADDRESS } from "../../constants";
import { getTokenMetadata } from "../../utils/decoders";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenABI = require("../../web3/abi/BLBABI.json");
import styles from "./PlayView.module.css";
import axios from "axios";
import MainStat from "./MainStat";
import HeatMap from "./HeatMap";
import Narrate from "./Narrate";
import { IoExitOutline } from "react-icons/all";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];

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

export const getPitchDescription = (s: number, h: number, v: number) => {
  const isStrike = h === 0 || h === 4 || v === 4 || v === 0 ? "A ball" : "A strike";
  const speed = s === 0 ? "Fast" : "Slow";
  let point = "";
  if (v < 2) {
    point = h < 2 ? ", high and inside" : h === 2 ? " and high" : ", high and outside";
  }
  if (v === 2) {
    point = h < 2 ? " and inside" : h === 2 ? " and down the middle" : " and outside";
  }
  if (v > 2) {
    point = h < 2 ? ", low and inside" : h === 2 ? " and low" : ", low and outside";
  }
  return `${isStrike}: ${speed}${point}.`;
};

export const getSwingDescription = (k: number, h: number, v: number) => {
  if (k === 2) {
    return "Nope. You are taking the pitch.";
  }
  const kind = k === 0 ? "For contact" : "For power";
  let point = "";
  if (v < 2) {
    point = h < 2 ? "high and inside" : h === 2 ? "high" : "high and outside";
  }
  if (v === 2) {
    point = h < 2 ? "inside" : h === 2 ? "down the middle" : "outside";
  }
  if (v > 2) {
    point = h < 2 ? "low and inside" : h === 2 ? "low" : "low and outside";
  }
  return `${kind}; ${point}.`;
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
  const { selectedSession, updateContext, contractAddress } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;
  const tokenContract = new web3ctx.web3.eth.Contract(tokenABI) as any;
  const isPitcher = (token?: Token) => selectedSession?.pair.pitcher?.id === token?.id;
  const [opponent, setOpponent] = useState<Token | undefined>(undefined);
  const [gameOver, setGameOver] = useState(false);

  const [pitcher, setPitcher] = useState<Token | undefined>(undefined);
  const [batter, setBatter] = useState<Token | undefined>(undefined);

  const sessionStatus = useQuery(
    ["session", selectedSession],
    async () => {
      if (!selectedSession) return undefined;
      const session = await gameContract.methods.getSession(selectedSession.sessionID).call();
      const progress = Number(
        await gameContract.methods.sessionProgress(selectedSession.sessionID).call(),
      );
      if (progress < 2 || progress > 4) {
        setGameOver(true);
      }
      const pitcherAddress = session.pitcherNFT.nftAddress;
      const pitcherTokenID = session.pitcherNFT.tokenID;
      const batterAddress = session.batterNFT.nftAddress;
      const batterTokenID = session.batterNFT.tokenID;
      const otherToken =
        batterAddress === selectedToken.address && batterTokenID === selectedToken.id
          ? { address: pitcherAddress, id: pitcherTokenID }
          : { address: batterAddress, id: batterTokenID };

      if (otherToken.address !== ZERO_ADDRESS && !(otherToken.address === opponent?.address)) {
        tokenContract.options.address = otherToken.address;
        const URI = await tokenContract.methods.tokenURI(otherToken.id).call();
        const staker = await tokenContract.methods.ownerOf(otherToken.id).call();
        const tokenMetadata = await getTokenMetadata(URI);

        setOpponent({
          ...otherToken,
          staker,
          image: tokenMetadata.image,
          name: tokenMetadata.name.split(` - ${otherToken.id}`)[0],
        });
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

      const secondsPerPhase = Number(await gameContract.methods.SecondsPerPhase().call());

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
        sessionID: selectedSession?.sessionID,
        progress,
        didPitcherCommit,
        didBatterCommit,
        didPitcherReveal,
        didBatterReveal,
        pitcherLeftSession,
        batterLeftSession,
        outcome,
        phaseStartTimestamp: Number(phaseStartTimestamp),
        secondsPerPhase: Number(secondsPerPhase),
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
      };
    },
    {
      refetchInterval: () => (gameOver ? false : 3000),
    },
  );

  const pitcherStats = useQuery(
    ["pitcher_stat", pitcher],
    async () => {
      if (!pitcher) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/stats";
      const stat = await axios.get(`${API_URL}/${pitcher.address}/${pitcher.id}`);
      return stat.data;
    },
    {
      enabled: !!pitcher,
    },
  );

  const batterStats = useQuery(
    ["batter_stat", batter],
    async () => {
      if (!batter) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/stats";
      const stat = await axios.get(`${API_URL}/${batter.address}/${batter.id}`);
      return stat.data;
    },
    {
      enabled: !!batter,
    },
  );

  const mockLocations = [
    19, 11, 5, 1, 2, 45, 29, 13, 8, 6, 70, 59, 47, 23, 12, 40, 35, 40, 32, 31, 11, 12, 23, 24, 34,
  ];

  const pitchDistributions = useQuery(
    ["pitch_distribution", pitcher],
    async () => {
      if (!pitcher) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/pitch_distribution";
      const res = await axios.get(`${API_URL}/${pitcher.address}/${pitcher.id}`);
      const counts = new Array(25).fill(0);
      res.data.pitch_distribution.forEach(
        (l: PitchLocation) => (counts[l.pitch_vertical * 5 + l.pitch_horizontal] = l.count),
      );
      const total = counts.reduce((acc, value) => acc + value);
      const rates = counts.map((value) => value / total);
      return { rates, counts };
    },
    {
      enabled: !!pitcher,
    },
  );

  const swingDistributions = useQuery(
    ["swing_distribution", batter],
    async () => {
      if (!batter) {
        return;
      }
      const API_URL = "https://api.fullcount.xyz/swing_distribution";
      const res = await axios.get(`${API_URL}/${batter.address}/${batter.id}`);
      const counts = new Array(25).fill(0);
      res.data.swing_distribution.forEach(
        (l: SwingLocation) => (counts[l.swing_vertical * 5 + l.swing_horizontal] = l.count),
      );
      const total = counts.reduce((acc, value) => acc + value);
      const rates = counts.map((value) => value / total);
      return { rates, counts };
    },
    {
      enabled: !!batter,
    },
  );

  useEffect(() => {
    setPitcher(isPitcher(selectedToken) ? selectedToken : opponent);
    setBatter(isPitcher(selectedToken) ? opponent : selectedToken);
  }, [selectedToken, opponent]);

  return (
    <Flex direction={"column"} gap={"20px"} minW={"100%"}>
      <Flex justifyContent={"space-between"} minW={"100%"} alignItems={"center"}>
        <Flex w={"150px"} h={"10px"} />

        {(sessionStatus.data?.progress === 3 ||
          sessionStatus.data?.progress === 4 ||
          sessionStatus.data?.progress === 2 ||
          sessionStatus.data?.progress === 5) && (
          <Timer
            start={Number(sessionStatus.data?.phaseStartTimestamp)}
            delay={sessionStatus.data?.progress === 5 ? 0 : sessionStatus.data?.secondsPerPhase}
            isActive={
              sessionStatus.data?.progress === 3 ||
              sessionStatus.data?.progress === 4 ||
              sessionStatus.data?.progress === 5
            }
          />
        )}
        <Flex w={"150px"} justifyContent={"end"}>
          <Image
            alt="exit"
            src={`${FULLCOUNT_ASSETS_PATH}/icons/exit.svg`}
            h={"20px"}
            w={"20px"}
            cursor={"pointer"}
            onClick={() => updateContext({ selectedSession: undefined, watchingToken: undefined })}
          />
        </Flex>
      </Flex>
      {sessionStatus.data && sessionStatus.data.progress > 2 && sessionStatus.data.progress < 6 && (
        <Flex w={"1000px"} placeSelf={"center"} minH={"108px"}>
          <Narrate
            sessionID={selectedSession?.sessionID ?? 0}
            speed={1}
            isComplete={sessionStatus.data.progress === 5}
          />
        </Flex>
      )}

      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Flex direction={"column"} gap={"10px"}>
          {isPitcher(selectedToken) ? (
            <>
              {selectedToken && (
                <Flex direction={"column"} gap="10px" alignItems={"center"}>
                  <Image
                    src={selectedToken?.image}
                    h={"300px"}
                    w={"300px"}
                    alt={selectedToken?.name}
                  />
                  <Text fontSize={"14px"} fontWeight={"700"}>
                    {selectedToken.name}
                  </Text>
                </Flex>
              )}
            </>
          ) : (
            <>
              {opponent ? (
                <Flex direction={"column"} gap="10px" alignItems={"center"} w={"300px"}>
                  <Image src={opponent?.image} h={"150px"} w={"150px"} alt={opponent?.name} />
                  <Text fontSize={"14px"} fontWeight={"700"}>
                    {opponent?.name}
                  </Text>
                </Flex>
              ) : (
                <Flex
                  direction={"column"}
                  gap="10px"
                  alignItems={"center"}
                  className={styles.pitcherGrid}
                >
                  <Box w={"300px"} h={"300px"} bg={"#4D4D4D"} border={"1px solid #F1E3BF"} />
                  <Box h={"21px"} w="300px" bg={"transparent"} />
                </Flex>
              )}
            </>
          )}
          {pitcherStats.data ? (
            <MainStat stats={pitcherStats.data} isPitcher={true} />
          ) : (
            <Flex h={"35px"} />
          )}

          {pitchDistributions.data ? (
            <HeatMap
              rates={pitchDistributions.data.rates}
              counts={pitchDistributions.data.counts}
              isPitcher
            />
          ) : (
            <Flex h={"150px"} />
          )}
        </Flex>

        {sessionStatus.data?.progress === 2 && selectedSession && selectedToken && (
          <InviteLink session={selectedSession} token={selectedToken} />
        )}
        {(sessionStatus.data?.progress === 3 || sessionStatus.data?.progress === 4) &&
          !sessionStatus.data?.isExpired && (
            <>
              {isPitcher(selectedToken) && sessionStatus.data && (
                <PitcherView sessionStatus={sessionStatus.data} />
              )}
              {!isPitcher(selectedToken) && sessionStatus.data && (
                <BatterView2 sessionStatus={sessionStatus.data} />
              )}
            </>
          )}
        {sessionStatus.data && sessionStatus.data.progress === 5 && (
          <Outcome
            outcome={sessionStatus.data?.outcome}
            isExpired={!!sessionStatus.data?.isExpired}
            pitch={sessionStatus.data.pitcherReveal}
            swing={sessionStatus.data.batterReveal}
            session={{
              ...sessionStatus.data,
              pair: isPitcher(selectedToken)
                ? { pitcher: selectedToken, batter: opponent }
                : { pitcher: opponent, batter: selectedToken },
            }}
          />
        )}
        <Flex direction={"column"} gap={"20px"}>
          {!isPitcher(selectedToken) ? (
            <>
              {selectedToken && (
                <Flex direction={"column"} gap="10px" alignItems={"center"}>
                  <Image
                    src={selectedToken?.image}
                    h={"300px"}
                    w={"300px"}
                    alt={selectedToken?.name}
                  />
                  <Text fontSize={"14px"} fontWeight={"700"}>
                    {selectedToken.name}
                  </Text>
                </Flex>
              )}
            </>
          ) : (
            <>
              {opponent ? (
                <Flex direction={"column"} gap="10px" alignItems={"center"} w={"300px"}>
                  <Image src={opponent?.image} h={"150px"} w={"150px"} alt={opponent?.name} />
                  <Text fontSize={"14px"} fontWeight={"700"}>
                    {opponent?.name}
                  </Text>
                </Flex>
              ) : (
                <Flex
                  direction={"column"}
                  gap="10px"
                  alignItems={"center"}
                  className={styles.pitcherGrid}
                >
                  <Box w={"300px"} h={"300px"} bg={"#4D4D4D"} border={"1px solid #F1E3BF"} />
                  <Box h={"21px"} w="300px" bg={"transparent"} />
                </Flex>
              )}
            </>
          )}
          {batterStats.data ? (
            <MainStat stats={batterStats.data} isPitcher={false} />
          ) : (
            <Flex h={"35px"} />
          )}

          {swingDistributions.data ? (
            <HeatMap
              rates={swingDistributions.data.rates}
              counts={swingDistributions.data.counts}
              isPitcher={false}
            />
          ) : (
            <Flex h={"150px"} />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default PlayView;
