import React, { useState, useEffect } from "react";
import { Text, Flex } from "@chakra-ui/react";
import styles from "./Timer.module.css";

interface TimerProps {
  start: number; // Start time in Unix timestamp format
  delay: number; // Delay in seconds
  isActive: boolean;
}

const Timer: React.FC<TimerProps> = ({ start, delay, isActive }) => {
  const [timeLeft, setTimeLeft] = useState("00:00");
  const [minutesLeft, setMinutesLeft] = useState("0");
  const [secondsLeft, setSecondsLeft] = useState("00");

  useEffect(() => {
    const updateTimer = () => {
      if (!isActive) {
        return;
      }
      const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
      const endTime = start + delay;
      const remainingTime = endTime - currentTime;

      if (remainingTime <= 0) {
        setMinutesLeft("0");
        setSecondsLeft("0");
        setTimeLeft("00:00");
        return;
      }

      const minutes = Math.floor(remainingTime / 60).toString();
      const seconds = (remainingTime % 60).toString().padStart(2, "0");
      setMinutesLeft(minutes);
      setSecondsLeft(seconds);

      setTimeLeft(`${minutes}:${seconds}`);
    };
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [start, delay]);

  return (
    <Flex gap={"10px"} mx={"auto"}>
      <Flex className={styles.countLeft}>
        <Flex direction={"column"} alignItems={"center"} gap={"4px"}>
          <Text
            fontSize={{ base: "9px", lg: "14px" }}
            fontWeight={"700"}
            color={"#1B1B1B"}
            lineHeight={"1"}
          >
            HOME
          </Text>
          <Text
            fontSize={{ base: "12px", lg: "17px" }}
            fontWeight={"700"}
            color={"#FFF"}
            lineHeight={"1"}
            py={"4px"}
          >
            0
          </Text>
        </Flex>
        <Flex direction={"column"} alignItems={"center"} gap={"4px"} justifyContent={"end"}>
          <Text
            fontSize={{ base: "8px", lg: "13px" }}
            fontWeight={"700"}
            color={"#1B1B1B"}
            lineHeight={"1"}
          >
            INN
          </Text>
          <Text
            fontSize={{ base: "10px", lg: "15px" }}
            fontWeight={"700"}
            color={"#FFF"}
            lineHeight={"1"}
          >
            BOT&nbsp;9
          </Text>
        </Flex>
        <Flex direction={"column"} alignItems={"center"} gap={"4px"}>
          <Text
            fontSize={{ base: "9px", lg: "14px" }}
            fontWeight={"700"}
            color={"#1B1B1B"}
            lineHeight={"1"}
          >
            AWAY
          </Text>
          <Text
            fontSize={{ base: "12px", lg: "17px" }}
            fontWeight={"700"}
            color={"#FFF"}
            lineHeight={"1"}
            py={"4px"}
          >
            1
          </Text>
        </Flex>
      </Flex>
      <Flex className={styles.timerContainer} opacity={isActive ? "1" : "0.3"}>
        <Text className={styles.title}>TIME LEFT</Text>
        <Flex gap={"7px"} alignItems={"start"}>
          <Text className={styles.time} fontFamily="Segment7Standard">
            {minutesLeft}
          </Text>
          <Text
            h={"25px"}
            fontSize={{ base: "10px", lg: "20px" }}
            lineHeight={"1"}
            color={"#FF8D8D"}
          >
            :
          </Text>
          <Text className={styles.time} fontFamily="Segment7Standard">
            {secondsLeft}
          </Text>
        </Flex>
      </Flex>

      <Flex className={styles.countLeft} minW={{ base: "100px", lg: "186px" }}>
        <Flex direction={"column"} alignItems={"center"} gap={"10px"}>
          <Text
            fontSize={{ base: "9px", lg: "14px" }}
            fontWeight={"700"}
            color={"#1B1B1B"}
            lineHeight={"1"}
          >
            BALL
          </Text>
          <Flex gap={1}>
            <div style={{ width: 6, height: 6, background: "white", borderRadius: 9999 }} />
            <div style={{ width: 6, height: 6, background: "white", borderRadius: 9999 }} />
            <div style={{ width: 6, height: 6, background: "white", borderRadius: 9999 }} />
          </Flex>
        </Flex>
        <Flex direction={"column"} alignItems={"center"} gap={"10px"}>
          <Text
            fontSize={{ base: "9px", lg: "14px" }}
            fontWeight={"700"}
            color={"#1B1B1B"}
            lineHeight={"1"}
          >
            STRIKE
          </Text>
          <Flex gap={1}>
            <div style={{ width: 6, height: 6, background: "white", borderRadius: 9999 }} />
            <div style={{ width: 6, height: 6, background: "white", borderRadius: 9999 }} />
          </Flex>
        </Flex>{" "}
        <Flex direction={"column"} alignItems={"center"} gap={"10px"}>
          <Text
            fontSize={{ base: "9px", lg: "14px" }}
            fontWeight={"700"}
            color={"#1B1B1B"}
            lineHeight={"1"}
          >
            OUT
          </Text>
          <Flex gap={1}>
            <div style={{ width: 6, height: 6, background: "white", borderRadius: 9999 }} />
            <div style={{ width: 6, height: 6, background: "white", borderRadius: 9999 }} />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Timer;
