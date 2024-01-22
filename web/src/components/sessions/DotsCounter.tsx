import { Flex } from "@chakra-ui/react";
import styles from "./DotsCount.module.css";

const DotsCounter = ({
  label,
  count,
  capacity,
}: {
  label: string;
  count: number;
  capacity: number;
}) => {
  return (
    <Flex alignItems={"center"} justifyContent={"space-between"} gap={"5px"}>
      <div className={styles.label}>{label}</div>
      <Flex gap={"4px"}>
        {Array.from({ length: capacity }, () => 0).map((_, idx) => (
          <div key={idx} className={idx < count ? styles.filledDot : styles.emptyDot} />
        ))}
      </Flex>
    </Flex>
  );
};

export default DotsCounter;
