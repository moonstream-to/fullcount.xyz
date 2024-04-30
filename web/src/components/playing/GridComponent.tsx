import React, { useState } from "react";
import { Box, Flex, Grid, Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import styles from "./PlayView.module.css";
import { useSound } from "../../hooks/useSound";

const assets = FULLCOUNT_ASSETS_PATH;

const GridComponent = ({
  selectedIndex,
  setSelectedIndex,
  isPitcher,
}: {
  selectedIndex: number;
  setSelectedIndex?: (value: number) => void;
  isPitcher: boolean;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const playSound = useSound();
  const handleMouseDown = (index: number) => {
    playSound("grid");
    if (!setSelectedIndex) {
      return;
    }
    if (selectedIndex === -1) {
      setSelectedIndex(index);
    }
    setIsDragging(true);
  };

  const handleMouseUp = (index: number) => {
    if (!setSelectedIndex) {
      return;
    }
    if (isDragging) {
      setIsDragging(false);
      setSelectedIndex(index);
    }
  };

  const strikeZone = [6, 7, 8, 11, 12, 13, 16, 17, 18];

  const generateCell = (index: number) => (
    <Box
      key={index}
      backgroundColor={
        index === selectedIndex
          ? strikeZone.includes(index)
            ? "#537250"
            : "#bebcba"
          : strikeZone.includes(index)
          ? "#669568"
          : "white"
      }
      display="flex"
      alignItems="center"
      justifyContent="center"
      border={"0.5px solid #262019"}
      // cursor={
      //   selectedIndex === index && !isDragging && setSelectedIndex
      //     ? "pointer"
      //     : selectedIndex === -1 || isDragging
      //     ? "inherit"
      //     : "default"
      // }
      fontSize={index === selectedIndex ? "22px" : "16px"}
      onMouseUp={() => handleMouseUp(index)}
      onMouseDown={() => handleMouseDown(index)}
      position={"relative"}
      className={styles.gridBox}
      zIndex={selectedIndex === index ? 1 : 2}
    ></Box>
  );

  return (
    <Flex
      className={
        (selectedIndex !== -1 && !isDragging) || !setSelectedIndex
          ? styles.pitcherGridSelected
          : isPitcher
          ? styles.pitcherGrid
          : styles.batterGrid
      }
      position={"relative"}
      mb={"5px"}
    >
      <Image
        src={`${assets}/batter.png`}
        position={"absolute"}
        top={"0"}
        right={"50%"}
        transform={"translateX(0) translateY(-33.3%)"}
        alt={""}
        h={"81.28vh"}
        minW={"33.95vh"}
        zIndex={"0"}
      />
      <Image
        src={`${assets}/pitcher.png`}
        position={"absolute"}
        top={"0"}
        right={"50%"}
        transform={"translateX(50%) translateY(-10vh)"}
        alt={""}
        w={"12.3"}
        h={"16.4vh"}
        zIndex={"0"}
      />
      <Grid
        templateColumns={"3.91vh 6.38vh 6.38vh 6.38vh 3.91vh"}
        templateRows={"3.91vh 7.82vh 7.82vh 7.82vh 3.91vh"}
        w={"fit-content"}
        gap={"2px"}
      >
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
    </Flex>
  );
};

export default GridComponent;
