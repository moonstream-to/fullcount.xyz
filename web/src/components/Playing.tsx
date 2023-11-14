import styles from "./Playing.module.css";
import { Flex, Text } from "@chakra-ui/react";
import { useGameContext } from "../contexts/GameContext";
import SessionsView from "./SessionsView";
import { useEffect } from "react";
import PlayView from "./PlayView";

const Playing = () => {
  const { selectedSession, updateContext, selectedToken } = useGameContext();

  useEffect(() => {
    console.log(selectedSession, selectedToken);
  }, [selectedSession, selectedToken]);

  return (
    <Flex className={styles.container}>
      {!selectedSession ? (
        <>
          <SessionsView />
        </>
      ) : (
        <>
          <PlayView />
        </>
      )}
    </Flex>
  );
};

export default Playing;
