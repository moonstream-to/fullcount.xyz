import React, { useState } from "react";
import { Box, Flex, Grid, Text, Image } from "@chakra-ui/react";
import { valueToColor } from "../../utils/colors";
import styles from "./HeatMap.module.css";
import { FULLCOUNT_ASSETS } from "../../constants";
import AnimatedMessage from "../AnimatedMessage";
import { useSound } from "../../hooks/useSound";

const leftBorder = [6, 11, 16];
const topBorder = [6, 7, 8];
const rightBorder = [8, 13, 18];
const bottomBorder = [16, 17, 18];
const modes = ["COLOR ONLY", "AMOUNT", "PERCENTAGE"];
const icons = ["color-only", "amount", "percentage"];

const HeatMap = ({
  rates,
  counts,
  takes,
  fast,
  isPitcher,
  showStrikeZone = false,
}: {
  rates: number[] | undefined;
  counts: number[] | undefined;
  takes?: number | undefined;
  fast?: number | undefined;
  showStrikeZone?: boolean;
  isPitcher: boolean;
}) => {
  const [showMode, setShowMode] = useState(0);
  const playSound = useSound();

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
        bg={rates ? valueToColor(rates[index], rates) : valueToColor(0, [0])}
        onClick={() => {
          playSound("heatmapClick");
          setShowMode(showMode === 2 ? 0 : showMode + 1);
        }}
      >
        {showMode !== 0 && rates && counts && (
          <Text fontSize={"9px"} color={"black"} fontWeight={"400"}>
            {showMode === 2 ? (rates[index] * 100).toFixed(2) : counts[index]}
          </Text>
        )}
      </Box>
    </Box>
  );

  return (
    <Flex direction={"column"} alignItems={"center"} gap={"0px"}>
      {counts && (
        <div className={styles.total}>
          {counts.reduce((acc, c) => acc + c)}
          {isPitcher ? " pitches" : " swings"}
          {isPitcher && fast ? ` (${fast} fast)` : !isPitcher && takes ? ` + ${takes} takes` : ""}
        </div>
      )}
      {!counts && (
        <div className={styles.total}>
          <AnimatedMessage message={"loading"} />
        </div>
      )}
      <Grid templateColumns="repeat(5, 1fr)" w={"fit-content"}>
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
      <div className={styles.heatLegend} />
      <div className={styles.modeSelector}>
        <div className={styles.modeDescription}>{modes[showMode]}</div>
        <div className={styles.icons}>
          {icons.map((fileName, idx) => (
            <Image
              key={idx}
              alt={""}
              w={"16px"}
              h={"16px"}
              src={`${FULLCOUNT_ASSETS}/icons/${fileName}${idx === showMode ? "-active" : ""}.svg`}
              onClick={() => {
                playSound("heatmapClick");
                setShowMode(idx);
              }}
              cursor={"pointer"}
            />
          ))}
        </div>
      </div>
    </Flex>
  );
};

export default HeatMap;
