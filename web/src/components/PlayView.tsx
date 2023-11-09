import { useGameContext } from "../contexts/GameContext";
import PitcherView from "./PitcherView";
import { Flex, Text } from "@chakra-ui/react";
import CharacterCard from "./CharacterCard";
import BatterView from "./BatterView";

export function getRowCol(index: number): [number, number] {
  const size = 5; // Size of the grid (5x5)
  const row = Math.floor(index / size);
  const col = index % size;
  return [row, col]; // 0-based index for row and column
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
  const { selectedSession, selectedToken, updateContext } = useGameContext();
  const isPitcher = () => selectedSession?.pair.pitcher?.id === selectedToken?.id;

  return (
    <Flex direction={"column"} gap={"20px"}>
      <Text onClick={() => updateContext({ selectedSession: undefined })} cursor={"pointer"}>
        Back
      </Text>
      {selectedToken && <CharacterCard token={selectedToken} active={false} />}
      {isPitcher() && <PitcherView />}

      {!isPitcher() && <BatterView />}
    </Flex>
  );
};
export default PlayView;
