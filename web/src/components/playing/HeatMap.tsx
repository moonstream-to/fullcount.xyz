import React, { useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { valueToColor } from "../../utils/colors";
import styles from "./HeatMap.module.css";

const leftBorder = [6, 11, 16];
const topBorder = [6, 7, 8];
const rightBorder = [8, 13, 18];
const bottomBorder = [16, 17, 18];

const HeatMap = ({
  rates,
  counts,
  takes,
  isPitcher,
  showStrikeZone = false,
}: {
  rates: number[];
  counts: number[];
  takes?: number;
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
        height={"26px"}
        width={"26px"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor={"pointer"}
        bg={valueToColor(rates[index], rates)}
        onClick={() => setShowMode(showMode === 2 ? 0 : showMode + 1)}
      >
        {showMode !== 0 && (
          <Text fontSize={"9px"} color={"black"} fontWeight={"400"}>
            {showMode === 1 ? (rates[index] * 100).toFixed(2) : counts[index]}
          </Text>
        )}
      </Box>
    </Box>
  );

  return (
    <Flex direction={"column"} alignItems={"center"} gap={"0px"}>
      <div className={styles.total}>
        {counts.reduce((acc, c) => acc + c)}
        {isPitcher ? " pitches" : " swings"}
      </div>
      <Grid templateColumns="repeat(5, 1fr)" w={"fit-content"}>
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
      <div className={styles.heatLegend} />
      {/*<Text fontSize={"10px"}>*/}
      {/*  Total: {counts.reduce((acc, c) => acc + c)}*/}
      {/*  {isPitcher ? " pitches" : " swings"}*/}
      {/*</Text>*/}
      {/*{!isPitcher && (takes || takes === 0) && (*/}
      {/*  <Text mt="-10px" fontSize={"10px"}>{`+ ${takes} take${takes === 1 ? "" : "s"}`}</Text>*/}
      {/*)}*/}
    </Flex>
  );
};

export default HeatMap;
