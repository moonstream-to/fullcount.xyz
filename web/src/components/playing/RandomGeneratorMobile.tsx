import { useCallback, useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import Web3 from "web3";
import globalStyles from "../GlobalStyles.module.css";
import styles from "./PlayView.module.css";

const MOVEMENTS_NUMBER = 30;

const RandomGeneratorMobile = ({
  isActive,
  onChange,
}: {
  isActive: boolean;
  onChange: (arg0: string) => void;
}) => {
  const web3 = new Web3();

  const [movements, setMovements] = useState<{ alpha: number; beta: number; gamma: number }[]>([]);

  const handleGenerate = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      DeviceMotionEvent.requestPermission();
    }
    window.addEventListener("deviceorientation", handleOrientation);
    setMovements([{ alpha: 0, beta: 0, gamma: 0 }]);
  };

  function handleOrientation(event: DeviceOrientationEvent) {
    setMovements((prevMovements) => {
      const round = (value: number | null) => (value ? Number((value / 10).toFixed(1)) : 0);
      const newMove = {
        alpha: round(event.alpha),
        beta: round(event.beta),
        gamma: round(event.gamma),
      };
      if (!prevMovements.length) {
        return [newMove];
      }
      const { alpha, beta, gamma } = prevMovements.slice(-1)[0];

      if (alpha !== newMove.alpha && beta !== newMove.beta && gamma !== newMove.gamma) {
        return [...prevMovements, newMove];
      }
      return prevMovements;
    });
  }

  const generateSeed = (points: { alpha: number; beta: number; gamma: number }[]) => {
    interface Coordinates {
      alpha: number;
      beta: number;
      gamma: number;
    }

    function separateCoordinates(coords: Coordinates[]): [number[], number[], number[]] {
      const alphas = coords.map((coord) => coord.alpha);
      const betas = coords.map((coord) => coord.beta);
      const gammas = coords.map((coord) => coord.gamma);

      return [alphas, betas, gammas];
    }

    const dataString = separateCoordinates(points).join("");
    const hash = web3.utils.sha3(dataString) || "";
    const uint256Seed = "0x" + hash.substring(2, 66);
    onChange(uint256Seed);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (movements.length >= MOVEMENTS_NUMBER) {
      window.removeEventListener("deviceorientation", handleOrientation);
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
              Tap
            </button>
          )}
          {movements.length > 0 && (
            <Flex w={"180px"} h={"31px"} border={"1px solid white"} position={"relative"}>
              <Box w={`${(movements.length / MOVEMENTS_NUMBER) * 100}%`} bg={"green"} />
              <Box bg={"gray"} />
              <Text className={styles.moveMouseTip}>rotate your device</Text>
            </Flex>
          )}
        </>
      )}
      {!isActive && <Flex className={styles.completedAction}>Generated</Flex>}
    </>
  );
};

export default RandomGeneratorMobile;
