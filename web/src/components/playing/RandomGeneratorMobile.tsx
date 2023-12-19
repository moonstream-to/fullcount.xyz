import { useCallback, useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import Web3 from "web3";
import globalStyles from "../GlobalStyles.module.css";
import styles from "./PlayView.module.css";

const MOVEMENTS_NUMBER = 1000;

const RandomGeneratorMobile = ({
  isActive,
  onChange,
}: {
  isActive: boolean;
  onChange: (arg0: string) => void;
}) => {
  const web3 = new Web3();

  const [movements, setMovements] = useState<{ alpha: number; beta: number; gamma: number }[]>([]);
  const [moved, setMoved] = useState("Not moved");

  const handleGenerate = () => {
    setMoved("trying to");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      DeviceMotionEvent.requestPermission();
    }
    // window.addEventListener("devicemotion", handleDeviceMotion);
    window.addEventListener("deviceorientation", handleOrientation);
  };

  // const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
  //   const { acceleration, rotationRate } = event;
  //   if (acceleration && rotationRate) {
  //     const moves = [acceleration.x, acceleration.y, acceleration.z]
  //       .map((m) => m ?? 0)
  //       .filter((m) => m !== 0);
  //     setMovements((prevMovements) => [...prevMovements, ...moves]);
  //   }
  // }, []);

  function handleOrientation(event: DeviceOrientationEvent) {
    setMoved("orientation");

    setMovements((prevMovements) => {
      const round = (value: number | null) => Number(value?.toFixed(2)) ?? 0;
      const newMove = {
        alpha: round(event.alpha),
        beta: round(event.beta),
        gamma: round(event.gamma),
      };
      if (!prevMovements.length) {
        return [newMove];
      }
      const { alpha, beta, gamma } = prevMovements.slice(-1)[0];

      if (alpha !== newMove.alpha || beta !== newMove.beta || gamma !== newMove.gamma) {
        return [...prevMovements, newMove];
      }
      return prevMovements;
    });
  }

  const generateSeed = (points: { alpha: number; beta: number; gamma: number }[]) => {
    function cantorPair(x: number, y: number): number {
      return 0.5 * (x + y) * (x + y + 1) + y;
    }

    function uniqNumber(x: number, y: number, z: number): number {
      const pairedXY = cantorPair(x, y);
      return cantorPair(pairedXY, z);
    }

    const dataString = points
      .map(({ alpha, beta, gamma }) => uniqNumber(alpha, beta, gamma))
      .join("");
    const hash = web3.utils.sha3(dataString) || "";
    const uint256Seed = "0x" + hash.substring(2, 66);
    onChange(uint256Seed);
  };

  // useEffect(() => {
  //   if (isActive && movements.length === 0) {
  //     setMoved("trying to");
  //     if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {
  //       DeviceMotionEvent.requestPermission();
  //     }
  //     window.addEventListener("devicemotion", handleDeviceMotion);
  //   }
  //
  //   if (movements.length >= MOVEMENTS_NUMBER) {
  //     window.removeEventListener("devicemotion", handleDeviceMotion);
  //     generateSeed(movements);
  //     setMovements([]);
  //   }
  //
  //   return () => {
  //     window.removeEventListener("devicemotion", handleDeviceMotion);
  //   };
  // }, [isActive, movements.length]);

  useEffect(() => {
    if (movements.length >= MOVEMENTS_NUMBER) {
      // window.removeEventListener("devicemotion", handleDeviceMotion);
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
