import { Flex } from "@chakra-ui/react";

import { useGameContext } from "../contexts/GameContext";
import SessionsView from "./sessions/SessionsView";
import PlayView from "./playing/PlayView";
import styles from "./Playing.module.css";

const Playing = () => {
  const { selectedSession, selectedToken, watchingToken } = useGameContext();

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
