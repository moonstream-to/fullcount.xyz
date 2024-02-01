import styles from "./Outcome.module.css";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import GrowingText from "./GrowingText";
import { pitchSpeed, swingKind } from "./PlayView";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import BallAnimation from "./BallAnimation";
import { Session } from "../../types";
import BatAnimation from "./BatAnimation";
import { useGameContext } from "../../contexts/GameContext";
const outcomes = [
  "Strike",
  "Ball",
  "Foul",
  "Single",
  "Double",
  "Triple",
  "Home Run",
  "In Play Out",
];
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
  pitch,
  swing,
  onDone,
  atBatOutcome,
}: {
  outcome: number;
  pitch: Pitch;
  swing: Swing;
  onDone: () => void;
  atBatOutcome: number;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPitchSpeedVisible, setIsPitchSpeedVisible] = useState(false);
  const [isSwingKindVisible, setIsSwingKindVisible] = useState(false);
  const [isPitchVisible, setIsPitchVisible] = useState(false);
  const [isSwingVisible, setIsSwingVisible] = useState(false);
  const [isOutcomeVisible, setIsOutcomeVisible] = useState(false);

  const { soundVolume } = useGameContext();
  const soundVolumeRef = useRef(soundVolume);
  const playingSounds = useRef<{ [key: string]: HTMLAudioElement | undefined }>({}).current;

  const updateVolume = (volume: number) => {
    Object.values(playingSounds).forEach((soundElement) => {
      if (soundElement) {
        soundElement.volume = volume / 100;
      }
    });
  };

  const atBatOutcomes = [
    "In Progress",
    "Strikeout",
    "Walk",
    "Single",
    "Double",
    "Triple",
    "Home Run",
    "In Play Out",
  ];

  useEffect(() => {
    soundVolumeRef.current = soundVolume;
    updateVolume(soundVolume);
  }, [soundVolume]);

  const playSound = (sound: string) => {
    const soundElement = document.getElementById(sound) as HTMLAudioElement;
    if (!soundElement) {
      return;
    }
    soundElement.volume = soundVolumeRef.current / 100;
    soundElement.play();
    playingSounds[sound] = soundElement;
  };

  useEffect(() => {
    const start = 0;

    const timers: NodeJS.Timeout[] = [];

    if (isVisible) {
      playSound("heartbeat");

      timers.push(setTimeout(() => setIsPitchSpeedVisible(true), 1000 + start));

      timers.push(setTimeout(() => playSound("whoosh"), 1000 + start));

      timers.push(
        setTimeout(() => {
          setIsSwingKindVisible(true);
          playSound("whoosh");
        }, 3500 + start),
      );

      timers.push(
        setTimeout(() => {
          setIsPitchVisible(true);
          playSound("swoosh");
        }, 4500 + start),
      );
      if (swing.kind !== 2) {
        timers.push(setTimeout(() => playSound("swing"), 6000 + start));
      }
      if (outcome > 1 && outcome < 6) {
        timers.push(setTimeout(() => playSound("hit"), 6500 + start));
      } else {
        timers.push(setTimeout(() => playSound("catch"), 6500 + start));
      }
      timers.push(
        setTimeout(() => {
          setIsSwingVisible(true);
        }, 6000 + start),
      );
      timers.push(
        setTimeout(() => {
          setIsOutcomeVisible(true);
        }, 7500 + start),
      );
      timers.push(
        setTimeout(() => {
          onDone();
        }, 9500 + start),
      );
      timers.push(setTimeout(() => playSound("clapping"), 7500 + start));
    } else {
      setIsSwingKindVisible(false);
      setIsPitchSpeedVisible(false);
      setIsOutcomeVisible(false);
      setIsSwingVisible(false);
      setIsPitchVisible(false);
    }
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);
  return (
    <Flex
      direction={"column"}
      justifyContent={"center"}
      position={"relative"}
      alignItems={"center"}
      mx={"auto"}
    >
      <Grid templateColumns="repeat(5, 1fr)" w={"fit-content"} position={"relative"}>
        <GrowingText
          isVisible={isPitchSpeedVisible}
          right={"100%"}
          top={{ base: "-10px", lg: "-75px" }}
          duration={"0.5s"}
        >
          <Text>{pitchSpeed[pitch.speed]}</Text>
        </GrowingText>
        <GrowingText
          isVisible={isSwingKindVisible}
          left={"100%"}
          top={{ base: "-10px", lg: "-75px" }}
          duration={"0.5s"}
        >
          <Text>{swingKind[swing.kind]}</Text>
        </GrowingText>
        <BallAnimation
          isVisible={isPitchVisible}
          startLeft={Number(3) * 50 - 25 - 20}
          startTop={-3 * 50 - 25 - 20}
          endLeft={(Number(pitch.horizontal) + 1) * 50 - 25 - 20}
          endTop={(Number(pitch.vertical) + 1) * 50 - 25 - 20}
          curve={pitch.speed === 1 ? 40 : 0}
          duration={"2.0s"}
          zIndex={"-1"}
        >
          <Image src={`${assets}/ball2.png`} h={"40px"} w={"40px"} alt={"o"} />
        </BallAnimation>
        {swing.kind !== 2 && (
          <BatAnimation
            isVisible={isSwingVisible}
            endLeft={(Number(swing.horizontal) + 1) * 50 - 25 - 20}
            endTop={(Number(swing.vertical) + 1) * 50 - 25 - 20}
            duration={"0.5s"}
          >
            <Image src={`${assets}/bat2.png`} h={"40px"} w={"40px"} alt={"x"} />
          </BatAnimation>
        )}
        <GrowingText
          isVisible={isOutcomeVisible}
          left={"50%"}
          top={"110%"}
          className={styles.result}
          css={{ transform: "translateX(-50%)" }}
          textAlign={"center"}
          w={"300px"}
        >
          {!!Number(atBatOutcome)
            ? atBatOutcomes[Number(atBatOutcome)].toUpperCase()
            : outcomes[outcome].toUpperCase()}
          !
        </GrowingText>
        {Array.from({ length: 25 }).map((_, i) => generateCell(i))}
      </Grid>
    </Flex>
  );
};
export default Outcome;
