import React, { useState } from "react";
import { Box, Flex, Grid, Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import styles from "./PlayView.module.css";

const assets = FULLCOUNT_ASSETS_PATH;

const GridComponent = ({
  selectedIndex,
  setSelectedIndex,
}: {
  selectedIndex: number;
  setSelectedIndex?: (value: number) => void;
}) => {
  const handleClick = (index: number) => {
    if (setSelectedIndex) {
      if (selectedIndex > -1 && selectedIndex === index) {
        setSelectedIndex(-1);
      }
      if (selectedIndex === -1) {
        setSelectedIndex(index);
      }
    }
  };

  const numbers = [
    10, 11, 12, 13, 14, 15, 1, 2, 3, 16, 17, 4, 5, 6, 18, 19, 7, 8, 9, 20, 21, 22, 23, 24, 25,
  ];
  const leftBorder = [6, 11, 16];
  const topBorder = [6, 7, 8];
  const rightBorder = [8, 13, 18];
  const bottomBorder = [16, 17, 18];

  // Generate cell with click handler and style based on index
  const generateCell = (index: number) => (
    <Box
      key={index}
      height="50px" // Set your desired height
      width="50px" // Set your desired width
      // bg={numbers[index] < 10 ? "#00441b" : "transparent"}
      color={index === selectedIndex ? "#e6482b" : numbers[index] < 10 ? "white" : "#b0b0b0"}
      display="flex"
      alignItems="center"
      justifyContent="center"
      border={"1px solid #333333"}
      borderLeftColor={leftBorder.includes(index) ? "#AAA" : "#333333"}
      borderRightColor={rightBorder.includes(index) ? "#AAA" : "#33333"}
      borderTopColor={topBorder.includes(index) ? "#AAA" : "#333333"}
      borderBottomColor={bottomBorder.includes(index) ? "#AAA" : "#333333"}
      // borderColor={numbers[index] < 10 ? "white" : "#b0b0b0"}
      cursor={selectedIndex === index ? "pointer" : selectedIndex > -1 ? "default" : "inherit"}
      onClick={() => handleClick(index)}
      fontSize={index === selectedIndex ? "22px" : "16px"}
      bg={"#111111"}
    >
      {index === selectedIndex && (
        <Image
          h={"32px"}
          w={"32px"}
          src={"https://static.simiotics.com/fullcount/ball4.png"}
          alt={"ball"}
        />
      )}
    </Box>
  );

  return (
    <Flex className={selectedIndex === -1 ? styles.pitcherGrid : styles.pitcherGridSelected}>
      <Grid templateColumns="repeat(5, 1fr)" w={"fit-content"}>
        {/* Generate cells for the grid */}
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
    </Flex>
  );
};

export default GridComponent;
