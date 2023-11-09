import React, { useState } from "react";
import { Box, Grid, Text } from "@chakra-ui/react";

const GridComponent = ({
  selectedIndex,
  setSelectedIndex,
}: {
  selectedIndex: number;
  setSelectedIndex: (value: number) => void;
}) => {
  const handleClick = (index: number) => {
    setSelectedIndex(index);
  };

  const numbers = [
    10, 11, 12, 13, 14, 15, 1, 2, 3, 16, 17, 4, 5, 6, 18, 19, 7, 8, 9, 20, 21, 22, 23, 24, 25,
  ];

  // Generate cell with click handler and style based on index
  const generateCell = (index: number) => (
    <Box
      key={index}
      height="50px" // Set your desired height
      width="50px" // Set your desired width
      bg={numbers[index] < 10 ? "#00441b" : "transparent"}
      color={index === selectedIndex ? "#e6482b" : numbers[index] < 10 ? "white" : "#b0b0b0"}
      display="flex"
      alignItems="center"
      justifyContent="center"
      border="1px"
      borderColor={numbers[index] < 10 ? "white" : "#b0b0b0"}
      cursor={"pointer"}
      onClick={() => handleClick(index)}
      fontSize={index === selectedIndex ? "22px" : "16px"}
    >
      <Text>{numbers[index]}</Text>
    </Box>
  );

  return (
    <Grid templateColumns="repeat(5, 1fr)">
      {/* Generate cells for the grid */}
      {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
    </Grid>
  );
};

export default GridComponent;
