import React, { useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { getColorByFactor } from "../../utils/colors";

const leftBorder = [6, 11, 16];
const topBorder = [6, 7, 8];
const rightBorder = [8, 13, 18];
const bottomBorder = [16, 17, 18];

const HeatMap = ({
  rates,
  counts,
  isPitcher,
  showStrikeZone = false,
}: {
  rates: number[];
  counts: number[];
  showStrikeZone?: boolean;
  isPitcher: boolean;
}) => {
  const [showMode, setShowMode] = useState(0);

  const generateCell = (index: number) => (
    <Box
      key={index}
      border={"1px solid #aaa"}
      borderLeftStyle={leftBorder.includes(index) && showStrikeZone ? "solid" : "none"}
      borderRightStyle={rightBorder.includes(index) && showStrikeZone ? "solid" : "none"}
      borderTopStyle={topBorder.includes(index) && showStrikeZone ? "solid" : "none"}
      borderBottomStyle={bottomBorder.includes(index) && showStrikeZone ? "solid" : "none"}
    >
      <Box
        height="20px"
        width="20px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor={"pointer"}
        bg={getColorByFactor(rates, rates[index] ?? "#111111")}
        onClick={() => setShowMode(showMode === 2 ? 0 : showMode + 1)}
      >
        {showMode !== 0 && (
          <Text fontSize={"6px"} color={"black"} fontWeight={"400"}>
            {showMode === 1 ? (rates[index] * 100).toFixed(2) : counts[index]}
          </Text>
        )}
      </Box>
    </Box>
  );

  return (
    <Flex direction={"column"} alignItems={"center"} gap={"10px"} minH={"150px"}>
      <Grid templateColumns="repeat(5, 1fr)" w={"fit-content"}>
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
      {showMode !== 0 && (
        <Text fontSize={"10px"}>
          Total: {counts.reduce((acc, c) => acc + c)}
          {isPitcher ? " pitches" : " swings"}
        </Text>
      )}
    </Flex>
  );
};

export default HeatMap;
