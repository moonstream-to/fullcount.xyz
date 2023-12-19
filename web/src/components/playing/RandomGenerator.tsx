import { useCallback, useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

import Web3 from "web3";

import globalStyles from "../GlobalStyles.module.css";
import styles from "./PlayView.module.css";

const MOVEMENTS_NUMBER = 500;

const RandomGenerator = ({
  isActive,
  onChange,
}: {
  isActive: boolean;
  onChange: (arg0: string) => void;
}) => {
  const web3 = new Web3();

  const [movements, setMovements] = useState<number[]>([]);

  const handleGenerate = () => {
    window.addEventListener("mousemove", handleMouseMove);
    setMovements((prevMovements) => [...prevMovements, 0, 0]);
  };
  const handleMouseMove = useCallback((event: MouseEvent) => {
    setMovements((prevMovements) => [...prevMovements, event.clientX, event.clientY]);
  }, []);
  const generateSeed = (movements: number[]) => {
    const dataString = movements.join("");
    const hash = web3.utils.sha3(dataString) || ""; // Use Web3 to hash the data string
    const uint256Seed = "0x" + hash.substring(2, 66); // Adjust the substring to get 64 hex characters
    onChange(uint256Seed);
  };

  useEffect(() => {
    if (movements.length >= MOVEMENTS_NUMBER) {
      window.removeEventListener("mousemove", handleMouseMove);
      generateSeed(movements);
      setMovements([]);
    }
  }, [movements.length]);

  return (
    <>
      {isActive && (
        <>
          {movements.length === 0 && (
            <button className={globalStyles.commitButton} onClick={handleGenerate}>
              Generate
            </button>
          )}
          {movements.length > 0 && (
            <Flex w={"180px"} h={"31px"} border={"1px solid white"} position={"relative"}>
              <Box w={`${(movements.length / 500) * 100}%`} bg={"green"} />
              <Box bg={"gray"} />
              <Text className={styles.moveMouseTip}>move mouse</Text>
            </Flex>
          )}
        </>
      )}
      {!isActive && <Flex className={styles.completedAction}>Generated</Flex>}
    </>
  );
};

export default RandomGenerator;
