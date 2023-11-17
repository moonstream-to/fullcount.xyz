import { useGameContext } from "../../contexts/GameContext";
import PitcherView from "./PitcherView";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import Timer from "./Timer";
import { useQuery } from "react-query";
import { useContext } from "react";
import Web3Context from "../../contexts/Web3Context/context";
import { Token } from "../../types";
import { CloseIcon } from "@chakra-ui/icons";
import Outcome from "./Outcome";
import BatterView2 from "./BatterView2";
import InviteLink from "./InviteLink";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import { ZERO_ADDRESS } from "../../constants";

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

const PlayView = () => {
  const { selectedSession, selectedToken, updateContext, contractAddress } = useGameContext();
  const web3ctx = useContext(Web3Context);
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;
  const isPitcher = (token?: Token) => selectedSession?.pair.pitcher?.id === token?.id;
  const opponent = (token?: Token) => {
    const result = isPitcher(token) ? selectedSession?.pair.batter : selectedSession?.pair.pitcher;
    return result?.address === ZERO_ADDRESS ? undefined : result;
  };

  const sessionStatus = useQuery(
    ["session", selectedSession],
    async () => {
      const session = await gameContract.methods.getSession(selectedSession?.sessionID).call();
      const progress = Number(
        await gameContract.methods.sessionProgress(selectedSession?.sessionID).call(),
      );

      console.log(session);
      const {
        didPitcherCommit,
        didBatterCommit,
        didPitcherReveal,
        didBatterReveal,
        outcome,
        phaseStartTimestamp,
        pitcherReveal,
        batterReveal,
      } = session;

      console.log(session, pitcherReveal, batterReveal);
      let isExpired = progress === 6;
      if (progress === 3 || progress === 4) {
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        const endTime = Number(phaseStartTimestamp) + (selectedSession?.secondsPerPhase ?? 0);
        const remainingTime = endTime - currentTime;
        if (remainingTime < 1) {
          isExpired = true;
        }
      }
      const speed: 0 | 1 = Number(pitcherReveal[1]) === 0 ? 0 : 1;
      const kind: 0 | 1 | 2 =
        Number(batterReveal[1]) === 0 ? 0 : Number(batterReveal[1]) === 1 ? 1 : 2;

      return {
        progress,
        didPitcherCommit,
        didBatterCommit,
        didPitcherReveal,
        didBatterReveal,
        outcome,
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
      refetchInterval: 15 * 1000,
    },
  );

  return (
    <Flex direction={"column"} gap={"20px"} minW={"100%"}>
      <Flex justifyContent={"space-between"} minW={"100%"} alignItems={"center"}>
        <Text w={"150px"}>{`Session ${selectedSession?.sessionID}`}</Text>

        {(selectedSession?.progress === 3 ||
          selectedSession?.progress === 4 ||
          selectedSession?.progress === 2) && (
          <Timer
            start={selectedSession.phaseStartTimestamp}
            delay={selectedSession.secondsPerPhase}
            isActive={selectedSession.progress === 3 || selectedSession.progress === 4}
          />
        )}
        <Flex w={"150px"} justifyContent={"end"}>
          <CloseIcon
            onClick={() => updateContext({ selectedSession: undefined })}
            cursor={"pointer"}
          />
        </Flex>
      </Flex>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
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
            {opponent(selectedToken) ? (
              <Flex direction={"column"} gap="10px" alignItems={"center"} w={"300px"}>
                <Image
                  src={opponent(selectedToken)?.image}
                  h={"150px"}
                  w={"150px"}
                  alt={opponent(selectedToken)?.name}
                />
                <Text fontSize={"14px"} fontWeight={"700"}>
                  {opponent(selectedToken)?.name}
                </Text>
              </Flex>
            ) : (
              <Flex direction={"column"} gap="10px" alignItems={"center"}>
                <Box w={"300px"} h={"300px"} bg={"#4D4D4D"} border={"1px solid #F1E3BF"} />
                <Box h={"21px"} w="300px" bg={"transparent"} />
              </Flex>
            )}
          </>
        )}

        {sessionStatus.data?.progress === 2 && selectedSession && (
          <InviteLink session={selectedSession} />
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
          />
        )}
        {/*{selectedSession?.pair}*/}
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
            {opponent(selectedToken) ? (
              <Flex direction={"column"} gap="10px" alignItems={"center"} w={"300px"}>
                <Image
                  src={opponent(selectedToken)?.image}
                  h={"150px"}
                  w={"150px"}
                  alt={opponent(selectedToken)?.name}
                />
                <Text fontSize={"14px"} fontWeight={"700"}>
                  {opponent(selectedToken)?.name}
                </Text>
              </Flex>
            ) : (
              <Flex direction={"column"} gap="10px" alignItems={"center"}>
                <Box w={"300px"} h={"300px"} bg={"#4D4D4D"} border={"1px solid #F1E3BF"} />
                <Box h={"21px"} w="300px" bg={"transparent"} />
              </Flex>
            )}
          </>
        )}
      </Flex>

      {/*<Text>{selectedSession?.progress}</Text>*/}
    </Flex>
  );
};
export default PlayView;
