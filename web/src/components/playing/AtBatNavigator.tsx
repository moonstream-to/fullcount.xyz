import { Flex, Text } from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { useGameContext } from "../../contexts/GameContext";
import styles from "./PlayView.module.css";
import { useEffect } from "react";

const AtBatNavigator = ({ sessionsIDs }: { sessionsIDs: number[] }) => {
  const { selectedSession, sessions, updateContext } = useGameContext();
  useEffect(() => {
    console.log(sessionsIDs.indexOf(selectedSession?.sessionID ?? 0));
  }, []);
  const handleArrow = (isBack: boolean) => {
    const change = isBack ? -1 : 1;
    if (!selectedSession?.sessionID) {
      return;
    }
    const newID = sessionsIDs.indexOf(selectedSession?.sessionID) + change;
    const newSession = sessions?.find((s) => s.sessionID === sessionsIDs[newID]);
    console.log(newID, newSession);
    updateContext({ selectedSession: newSession });
  };

  if (!selectedSession?.sessionID) {
    return <></>;
  }
  return (
    <Flex gap={"10px"}>
      {sessionsIDs.indexOf(selectedSession?.sessionID ?? 0) > 0 && (
        <ArrowBackIcon onClick={() => handleArrow(true)} />
      )}
      <Text className={styles.pitchTitle}>
        Pitch {sessionsIDs.indexOf(selectedSession?.sessionID ?? 0)}
      </Text>
      {sessionsIDs.indexOf(selectedSession?.sessionID ?? 0) < sessionsIDs.length && (
        <ArrowForwardIcon />
      )}
    </Flex>
  );
};

export default AtBatNavigator;
