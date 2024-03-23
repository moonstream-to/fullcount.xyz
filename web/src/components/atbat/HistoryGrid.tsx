import React from "react";
import { Box, Flex, Grid } from "@chakra-ui/react";

const HistoryGrid = ({ vertical, horizontal }: { vertical: string; horizontal: string }) => {
  const getCellColor = (index: number, vertical: string, horizontal: string) => {
    if (
      Number(vertical) > -1 &&
      Number(horizontal) > -1 &&
      index === Number(vertical) * 5 + Number(horizontal)
    ) {
      return "white";
    }
    return "#8EAB8F";
  };

  const generateCell = (index: number) => (
    <Box key={index} backgroundColor={getCellColor(index, vertical, horizontal)}></Box>
  );

  return (
    <Flex position={"relative"}>
      <Grid
        templateColumns={"3px 4px 4px 4px 3px"}
        templateRows={"3px 5px 5px 5px 3px"}
        gap={"0.5px"}
        backgroundColor={"#627865"}
        border={"0.5px solid #627865"}
        w={"fit-content"}
      >
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
    </Flex>
  );
};

export default HistoryGrid;
