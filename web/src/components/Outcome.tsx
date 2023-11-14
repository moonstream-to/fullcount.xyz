import styles from "./Outcome.module.css";
import { Flex, Text } from "@chakra-ui/react";
const outcomes = ["Strikeout", "Walk", "Single", "Double", "Triple", "Home Run", "In Play Out"];
const Outcome = ({ outcome, isExpired }: { outcome: number; isExpired: boolean }) => {
  return (
    <Flex className={styles.container}>
      {isExpired ? (
        <Text className={styles.result}>Expired!</Text>
      ) : (
        <Text className={styles.result}>{outcomes[outcome].toUpperCase()}!</Text>
      )}
    </Flex>
  );
};
export default Outcome;
