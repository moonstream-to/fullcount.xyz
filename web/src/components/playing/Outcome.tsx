import styles from "./Outcome.module.css";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import GrowingText from "./GrowingText";
import { pitchSpeed, swingKind } from "./PlayView";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import BallAnimation from "./BallAnimation";
const outcomes = ["Strikeout", "Walk", "Single", "Double", "Triple", "Home Run", "In Play Out"];
const assets = FULLCOUNT_ASSETS_PATH;

interface Swing {
  kind: 0 | 1 | 2;
  vertical: number;
  horizontal: number;
}

interface Pitch {
  speed: 0 | 1;
  vertical: number;
  horizontal: number;
}

const leftBorder = [6, 11, 16];
const topBorder = [6, 7, 8];
const rightBorder = [8, 13, 18];
const bottomBorder = [16, 17, 18];

const generateCell = (index: number) => (
  <Box
    key={index}
    height="50px"
    width="50px"
    border={"1px solid white"}
    borderLeftStyle={leftBorder.includes(index) ? "solid" : "none"}
    borderRightStyle={rightBorder.includes(index) ? "solid" : "none"}
    borderTopStyle={topBorder.includes(index) ? "solid" : "none"}
    borderBottomStyle={bottomBorder.includes(index) ? "solid" : "none"}
    display="flex"
    alignItems="center"
    justifyContent="center"
  ></Box>
);

const Outcome = ({
  outcome,
  isExpired,
  pitch,
  swing,
}: {
  outcome: number;
  isExpired: boolean;
  pitch: Pitch;
  swing: Swing;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPitchSpeedVisible, setIsPitchSpeedVisible] = useState(false);
  const [isSwingKindVisible, setIsSwingKindVisible] = useState(false);
  const [isPitchVisible, setIsPitchVisible] = useState(false);
  const [isSwingVisible, setIsSwingVisible] = useState(false);
  const [isOutcomeVisible, setIsOutcomeVisible] = useState(false);

  useEffect(() => {
    console.log(pitch, swing);
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;
    let timer4: NodeJS.Timeout;

    if (isVisible) {
      setIsPitchSpeedVisible(true);
      timer1 = setTimeout(() => setIsSwingKindVisible(true), 1500);
      timer2 = setTimeout(() => setIsPitchVisible(true), 1500);
      timer3 = setTimeout(() => setIsSwingVisible(true), 3350);
      timer4 = setTimeout(() => setIsOutcomeVisible(true), 4000);
    } else {
      setIsSwingKindVisible(false);
      setIsPitchSpeedVisible(false);
      setIsOutcomeVisible(false);
      setIsSwingVisible(false);
      setIsPitchVisible(false);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);
  return (
    <Flex direction={"column"} h={"700px"} justifyContent={"center"} position={"relative"}>
      {/*<button onClick={() => setIsVisible(!isVisible)}>{isVisible ? "Reset" : "Start"}</button>*/}

      <GrowingText isVisible={isPitchSpeedVisible} right={"110%"} duration={"0.5s"}>
        <Text>{pitchSpeed[pitch.speed]}</Text>
      </GrowingText>
      <GrowingText isVisible={isSwingKindVisible} left={"110%"} duration={"0.5s"}>
        <Text>{swingKind[swing.kind]}</Text>
      </GrowingText>
      <Grid templateColumns="repeat(5, 1fr)" w={"fit-content"} position={"relative"}>
        <BallAnimation
          isVisible={isPitchVisible}
          startLeft={Number(1) * 50 - 25 - 20}
          startTop={-220}
          endLeft={(Number(pitch.horizontal) + 1) * 50 - 25 - 20}
          endTop={(Number(pitch.vertical) + 1) * 50 - 25 - 20}
          curve={pitch.speed === 1 ? 40 : 0}
          duration={"2.0s"}
          zIndex={"-1"}
        >
          <Image src={`${assets}/ball2.png`} h={"40px"} w={"40px"} alt={"o"} />
        </BallAnimation>
        {swing.kind !== 2 && (
          <GrowingText
            isVisible={isSwingVisible}
            left={`${(Number(swing.horizontal) + 1) * 50 - 25 - 20}px`}
            top={`${(Number(swing.vertical) + 1) * 50 - 25 - 20}px`}
            duration={"0s"}
          >
            <Image src={`${assets}/bat2.png`} h={"40px"} w={"40px"} alt={"x"} />
          </GrowingText>
        )}
        <GrowingText
          isVisible={isOutcomeVisible}
          left={"50%"}
          top={"110%"}
          className={styles.result}
          css={{ transform: "translateX(-50%)" }}
          textAlign={"center"}
        >
          {outcomes[outcome].toUpperCase()}!
        </GrowingText>
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
    </Flex>
  );
};
export default Outcome;
