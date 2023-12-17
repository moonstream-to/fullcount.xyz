import { useCallback, useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import Web3 from "web3";
import globalStyles from "../GlobalStyles.module.css";
import styles from "./PlayView.module.css";

const MOVEMENTS_NUMBER = 500;

const RandomGeneratorMobile = ({
  isActive,
  onChange,
}: {
  isActive: boolean;
  onChange: (arg0: string) => void;
}) => {
  const web3 = new Web3();

  const [movements, setMovements] = useState<number[]>([]);
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
    window.addEventListener("devicemotion", handleDeviceMotion);
    setMovements((prevMovements) => [...prevMovements, 0, 0]);
  };

  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    const { acceleration, rotationRate } = event;
    setMoved("Moved");
    if (acceleration && rotationRate) {
      setMovements((prevMovements) => [
        ...prevMovements,
        acceleration.x || 0,
        acceleration.y || 0,
        acceleration.z || 0,
        rotationRate.alpha || 0,
        rotationRate.beta || 0,
        rotationRate.gamma || 0,
      ]);
    }
  }, []);

  const generateSeed = (movements: number[]) => {
    const dataString = movements.join("");
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
      window.removeEventListener("devicemotion", handleDeviceMotion);
      generateSeed(movements);
      setMovements([]);
    }
  }, [movements.length]);

  return (
    <>
      {isActive && (
        <>
          {moved}
          {movements.length === 0 && (
            <button className={globalStyles.commitButton} onClick={handleGenerate}>
              Tap
            </button>
          )}
          {movements.length > 0 && (
            <Flex w={"180px"} h={"31px"} border={"1px solid white"} position={"relative"}>
              <Box w={`${(movements.length / MOVEMENTS_NUMBER) * 100}%`} bg={"green"} />
              <Box bg={"gray"} />
              <Text className={styles.moveMouseTip}>Move and rotate your device</Text>
            </Flex>
          )}
        </>
      )}
      {!isActive && <Flex className={styles.completedAction}>Generated</Flex>}
    </>
  );
};

export default RandomGeneratorMobile;
