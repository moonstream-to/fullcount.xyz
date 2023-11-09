import styles from "./Playing.module.css";
import { Flex, Text } from "@chakra-ui/react";
import { useGameContext } from "../contexts/GameContext";
import SessionsView from "./SessionsView";

const Playing = () => {
  const { sessionId, updateContext } = useGameContext();
  return (
    <Flex className={styles.container}>
      <Text cursor={"pointer"} onClick={() => updateContext({ selectedToken: undefined })}>
        Back
      </Text>
      {!sessionId ? (
        <SessionsView />
      ) : (
        <>
          <Text className={styles.title}>Playing</Text>
          <Text className={styles.prompt}>Soon...</Text>
        </>
      )}
    </Flex>
  );
};

export default Playing;
