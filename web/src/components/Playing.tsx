import styles from "./Playing.module.css";
import { Flex, Text } from "@chakra-ui/react";
import { useGameContext } from "../contexts/GameContext";
import SessionsView from "./sessions/SessionsView";
import { useEffect } from "react";
import PlayView from "./playing/PlayView";

const Playing = () => {
  const { selectedSession, updateContext, selectedToken, watchingToken } = useGameContext();

  return (
    <Flex className={styles.container}>
      {!selectedSession && <SessionsView />}
      {selectedSession && watchingToken && <PlayView selectedToken={watchingToken} />}
      {selectedSession && !watchingToken && selectedToken && (
        <PlayView selectedToken={selectedToken} />
      )}
    </Flex>
  );
};

export default Playing;
