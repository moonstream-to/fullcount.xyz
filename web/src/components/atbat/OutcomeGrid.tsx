import React from "react";
import { Box, Flex, Grid, Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { BatterReveal, PitcherReveal } from "../../types";

const assets = FULLCOUNT_ASSETS_PATH;

const GridComponent = ({
  pitchReveal,
  swingReveal,
}: {
  pitchReveal: PitcherReveal;
  swingReveal: BatterReveal;
}) => {
  const strikeZone = [6, 7, 8, 11, 12, 13, 16, 17, 18];

  const generateCell = (index: number) => (
    <Box
      key={index}
      backgroundColor={strikeZone.includes(index) ? "#669568" : "white"}
      display="flex"
      alignItems="center"
      justifyContent="center"
      border={"0.5px solid #262019"}
      position={"relative"}
    ></Box>
  );

  return (
    <Flex position={"relative"} mb={"5px"}>
      <Grid
        templateColumns="19px 31px 31px 31px 19px"
        templateRows={"19px 38px 38px 38px 19px"}
        w={"fit-content"}
        gap={"2px"}
      >
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
    </Flex>
  );
};

export default GridComponent;
