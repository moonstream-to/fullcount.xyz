import React, { useEffect } from "react";
import { Box, Flex, Grid, Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { BatterReveal, PitcherReveal } from "../../types";
import styles from "./Outcome2.module.css";

const assets = FULLCOUNT_ASSETS_PATH;

const GridComponent = ({
  pitchReveal,
  swingReveal,
}: {
  pitchReveal: PitcherReveal;
  swingReveal: BatterReveal;
}) => {
  const strikeZone = [6, 7, 8, 11, 12, 13, 16, 17, 18];
  const columnCenters = [9.5, 36.5, 69.5, 102.5, 129.5];
  const rowCenters = [9.5, 40.0, 80.0, 120.0, 150.5];

  useEffect(() => {
    console.log(pitchReveal);
  }, [pitchReveal]);

  const generateCell = (index: number) => (
    <Box
      key={index}
      backgroundColor={strikeZone.includes(index) ? "#669568" : "white"}
      display="flex"
      alignItems="center"
      justifyContent="center"
      border={"0.5px solid #262019"}
    ></Box>
  );

  return (
    <Flex position={"relative"} mb={"5px"}>
      <Image
        src={`${FULLCOUNT_ASSETS_PATH}/ball.png`}
        alt={"o"}
        className={styles.ballImage}
        left={`${columnCenters[Number(pitchReveal.horizontal)]}px`}
        top={`${rowCenters[Number(pitchReveal.vertical)]}px`}
      />

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
