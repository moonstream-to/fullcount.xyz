import { Box, Flex, Text } from "@chakra-ui/react";
import globalStyles from "./GlobalStyles.module.css";
import styles from "./PlayView.module.css";
import GridComponent from "./GridComponent";
import { useCallback, useContext, useEffect, useState } from "react";
import { getRowCol, horizontalLocations, pitchSpeed, verticalLocations } from "./PlayView";
import { signPitch } from "./Signing";
import web3Context from "../contexts/Web3Context";
import Web3Context from "../contexts/Web3Context/context";
import { useGameContext } from "../contexts/GameContext";
import { useMutation, useQueryClient } from "react-query";
import useMoonToast from "../hooks/useMoonToast";
import { SessionStatus } from "./PlayView";
import { Session } from "../types";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FullcountABI = require("../web3/abi/FullcountABI.json");

export type PLAY_STATUS = "TO_GENERATE" | "TO_COMMIT" | "TO_REVEAL" | "COMPLETE";

const PitcherView = ({ sessionStatus }: { sessionStatus: SessionStatus }) => {
  const [speed, setSpeed] = useState(0);
  const [gridIndex, setGridIndex] = useState(12);
  const [nonce, setNonce] = useState("0");
  const [status, setStatus] = useState<PLAY_STATUS>("TO_GENERATE");
  const web3ctx = useContext(Web3Context);
  const { selectedSession, contractAddress, selectedToken } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const handleCommit = async () => {
    const sign = await signPitch(
      web3ctx.account,
      window.ethereum,
      nonce,
      speed,
      getRowCol(gridIndex)[0],
      getRowCol(gridIndex)[1],
    );
    localStorage.setItem(
      `fullcount.xyz-${contractAddress}-${selectedSession?.sessionID}-${selectedToken?.id}`,
      JSON.stringify({
        nonce,
        speed,
        vertical: getRowCol(gridIndex)[0],
        horizontal: getRowCol(gridIndex)[1],
      }),
    );
    console.log(nonce, speed, getRowCol(gridIndex)[0], getRowCol(gridIndex)[1], sign);
    commitPitch.mutate({ sign });
  };

  const handleReveal = async () => {
    const item =
      localStorage.getItem(
        `fullcount.xyz-${contractAddress}-${selectedSession?.sessionID}-${selectedToken?.id}` ?? "",
      ) ?? "";
    const reveal = JSON.parse(item);
    console.log(reveal);
    revealPitch.mutate({
      nonce: reveal.nonce,
      speed: reveal.speed,
      vertical: reveal.vertical,
      horizontal: reveal.horizontal,
    });
  };

  const [movements, setMovements] = useState<number[]>([]);
  const [seed, setSeed] = useState("");

  useEffect(() => {
    setMovements([]);
  }, [selectedSession]);

  useEffect(() => {
    if (movements.length > 499) {
      window.removeEventListener("mousemove", handleMouseMove);
      setSeed(generateSeed(movements));
      setMovements([]);
    }
  }, [movements.length]);

  const generateSeed = (movements: number[]): string => {
    const dataString = movements.join("");
    const hash = web3ctx.web3.utils.sha3(dataString) || ""; // Use Web3 to hash the data string
    const uint256Seed = "0x" + hash.substring(2, 66); // Adjust the substring to get 64 hex characters
    console.log(uint256Seed, hash);
    setNonce(uint256Seed);
    return uint256Seed;
  };
  const handleMouseMove = useCallback((event: MouseEvent) => {
    setMovements((prevMovements) => [...prevMovements, event.clientX, event.clientY]);
  }, []);
  const handleGenerate = () => {
    window.addEventListener("mousemove", handleMouseMove);
  };

  const toast = useMoonToast();
  const queryClient = useQueryClient();

  const commitPitch = useMutation(
    async ({ sign }: { sign: string }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return gameContract.methods.commitPitch(selectedSession?.sessionID, sign).send({
        from: web3ctx.account,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
      });
    },
    {
      onSuccess: () => {
        console.log("should invalidate");
        queryClient.refetchQueries("sessions");
        // queryClient.invalidateQueries("sessions");
        setStatus("TO_REVEAL");
        toast("Commit successful.", "success");
      },
      onError: (e: Error) => {
        toast("Commmit failed." + e?.message, "error");
      },
    },
  );

  const revealPitch = useMutation(
    async ({
      nonce,
      speed,
      vertical,
      horizontal,
    }: {
      nonce: string;
      speed: number;
      vertical: number;
      horizontal: number;
    }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return gameContract.methods
        .revealPitch(selectedSession?.sessionID, nonce, speed, vertical, horizontal)
        .send({
          from: web3ctx.account,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
        });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("sessions");
        toast("Reveal successful.", "success");
      },
      onError: (e: Error) => {
        toast("Reveal failed." + e?.message, "error");
      },
    },
  );

  const resolve = async () => {
    const res = await gameContract.methods
      .resolve(
        { nonce: 0, speed: 0, vertical: 2, horizontal: 2 },
        { nonce: 0, kind: 0, vertical: 2, horizontal: 2 },
      )
      .call();
    console.log(res);
  };

  const gameStatus = (session: SessionStatus) => {
    if (session.progress === 2) {
      return "waiting for batter";
    }
    if (session.progress === 3) {
      if (session.didBatterCommit) {
        return "Batter comitted. Waiting for your move";
      }
      return session.didPitcherCommit ? "Waiting batter to commit" : "Waiting for commits";
    }
    if (session.progress === 4) {
      if (session.didBatterReveal) {
        return "Batter revealed. Waiting for your move";
      }
      return session.didPitcherReveal ? "Waiting batter to reveal" : "Waiting for reveals";
    }
    if (session.progress === 5) {
      return `Outcome: ${session.outcome}`;
    }
    if (session.progress === 6) {
      return "Session expired";
    }
    return "You have opened non-existing session somehow";
  };

  useEffect(() => {
    console.log(selectedSession);
  }, [selectedSession]);

  return (
    <Flex direction={"column"} gap={"15px"}>
      <Text>{gameStatus(sessionStatus)}</Text>
      <Flex justifyContent={"center"} gap={"20px"}>
        <Flex
          className={speed === 0 ? styles.activeChoice : styles.inactiveChoice}
          onClick={() => setSpeed(0)}
        >
          Fast
        </Flex>
        <Flex
          className={speed === 1 ? styles.activeChoice : styles.inactiveChoice}
          onClick={() => setSpeed(1)}
        >
          Slow
        </Flex>
      </Flex>
      <GridComponent selectedIndex={gridIndex} setSelectedIndex={setGridIndex} />
      <Text>{verticalLocations[getRowCol(gridIndex)[0] as keyof typeof horizontalLocations]}</Text>
      <Text>
        {horizontalLocations[getRowCol(gridIndex)[1] as keyof typeof horizontalLocations]}
      </Text>
      <Text> {pitchSpeed[speed as keyof typeof pitchSpeed]}</Text>
      {!seed && movements.length === 0 && (
        <button className={globalStyles.button} onClick={handleGenerate}>
          Generate
        </button>
      )}
      {movements.length > 0 && (
        <Flex
          onClick={() => window.removeEventListener("mousemove", handleMouseMove)}
          w={"100%"}
          h={"20px"}
          border={"1px solid white"}
        >
          <Box w={`${(movements.length / 500) * 100}%`} bg={"green"} />
          <Box bg={"gray"} />
        </Flex>
      )}
      {seed && status !== "TO_REVEAL" && (
        <>
          <button className={globalStyles.button} onClick={handleCommit}>
            Commit
          </button>
        </>
      )}
      {status !== "TO_REVEAL" && (
        <button className={globalStyles.button} onClick={handleReveal}>
          Reveal
        </button>
      )}
    </Flex>
  );
};

export default PitcherView;
