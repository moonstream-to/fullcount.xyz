import React, { useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { valueToColor } from "../../utils/colors";

const HeatMapSmall = ({ rates }: { rates: number[] }) => {
  const generateCell = (index: number) => (
    <Box key={index}>
      <Box
        height={{ base: "4px", lg: "4px" }}
        width={{ base: "4px", lg: "4px" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor={"pointer"}
        bg={valueToColor(rates[index], rates)}
      />
    </Box>
  );

  return (
    <Flex direction={"column"} alignItems={"center"} gap={"10px"} minH={{ base: "", lg: "150px" }}>
      <Grid templateColumns="repeat(5, 1fr)" w={"fit-content"} border={"2px solid #262019"}>
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
    </Flex>
  );
};

export default HeatMapSmall;
