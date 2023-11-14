import { useGameContext } from "../contexts/GameContext";
import PitcherView from "./PitcherView";
import { Flex, Text } from "@chakra-ui/react";
import CharacterCard from "./CharacterCard";
import BatterView from "./BatterView";
import { sessionStates } from "./SessionViewSmall";
import Timer from "./Timer";
import { useQuery } from "react-query";
import { useContext } from "react";
import Web3Context from "../contexts/Web3Context/context";
import { Session, Token } from "../types";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
  const isPitcher = () => selectedSession?.pair.pitcher?.id === selectedToken?.id;

  const sessionStatus = useQuery(
    ["session", selectedSession],
    async () => {
      console.log("selected session");

      const session = await gameContract.methods.getSession(selectedSession?.sessionID).call();
      const progress = Number(
        await gameContract.methods.sessionProgress(selectedSession?.sessionID).call(),
      );
      const { didPitcherCommit, didBatterCommit, didPitcherReveal, didBatterReveal, outcome } =
        session;

      return {
        progress,
        didPitcherCommit,
        didBatterCommit,
        didPitcherReveal,
        didBatterReveal,
        outcome,
      };
    },
    {
      refetchInterval: 15 * 1000,
    },
  );

  return (
    <Flex direction={"column"} gap={"20px"}>
      <Text onClick={() => updateContext({ selectedSession: undefined })} cursor={"pointer"}>
        Back
      </Text>
      <Text>{selectedSession?.progress}</Text>

      {(selectedSession?.progress === 3 || selectedSession?.progress === 4) && (
        <Timer
          start={selectedSession.phaseStartTimestamp}
          delay={selectedSession.secondsPerPhase}
        />
      )}
      {selectedToken && <CharacterCard token={selectedToken} isActive={false} />}
      {isPitcher() && sessionStatus.data && <PitcherView sessionStatus={sessionStatus.data} />}

      {!isPitcher() && <BatterView />}
    </Flex>
  );
};
export default PlayView;
