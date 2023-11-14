import { Box, Flex, Text } from "@chakra-ui/react";
import globalStyles from "./GlobalStyles.module.css";
import styles from "./PlayView.module.css";
import GridComponent from "./GridComponent";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  getRowCol,
  horizontalLocations,
  pitchSpeed,
  swingKind,
  verticalLocations,
} from "./PlayView";
import { signPitch, signSwing } from "./Signing";
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

const BatterView2 = ({ sessionStatus }: { sessionStatus: SessionStatus }) => {
  const [kind, setKind] = useState(0);
  const [gridIndex, setGridIndex] = useState(12);
  const [nonce, setNonce] = useState("0");
  const [status, setStatus] = useState<PLAY_STATUS>("TO_GENERATE");
  const web3ctx = useContext(Web3Context);
  const { selectedSession, contractAddress, selectedToken } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const handleCommit = async () => {
    const sign = await signSwing(
      web3ctx.account,
      window.ethereum,
      nonce,
      kind,
      getRowCol(gridIndex)[0],
      getRowCol(gridIndex)[1],
    );
    localStorage.setItem(
      `fullcount.xyz-${contractAddress}-${selectedSession?.sessionID}-${selectedToken?.id}`,
      JSON.stringify({
        nonce,
        kind,
        vertical: getRowCol(gridIndex)[0],
        horizontal: getRowCol(gridIndex)[1],
      }),
    );
    console.log(nonce, kind, getRowCol(gridIndex)[0], getRowCol(gridIndex)[1], sign);
    commitSwing.mutate({ sign });
  };

  const handleReveal = async () => {
    const item =
      localStorage.getItem(
        `fullcount.xyz-${contractAddress}-${selectedSession?.sessionID}-${selectedToken?.id}` ?? "",
      ) ?? "";
    const reveal = JSON.parse(item);
    console.log(reveal);
    revealSwing.mutate({
      nonce: reveal.nonce,
      kind: reveal.kind,
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
    setMovements((prevMovements) => [...prevMovements, 0, 0]);
  };

  const toast = useMoonToast();
  const queryClient = useQueryClient();

  const commitSwing = useMutation(
    async ({ sign }: { sign: string }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return gameContract.methods.commitSwing(selectedSession?.sessionID, sign).send({
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

  const revealSwing = useMutation(
    async ({
      nonce,
      kind,
      vertical,
      horizontal,
    }: {
      nonce: string;
      kind: number;
      vertical: number;
      horizontal: number;
    }) => {
      if (!web3ctx.account) {
        return new Promise((_, reject) => {
          reject(new Error(`Account address isn't set`));
        });
      }

      return gameContract.methods
        .revealSwing(selectedSession?.sessionID, nonce, kind, vertical, horizontal)
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

  useEffect(() => {
    console.log(sessionStatus);
  }, [sessionStatus]);

  const resolve = async () => {
    const res = await gameContract.methods
      .resolve(
        { nonce: 0, speed: 0, vertical: 2, horizontal: 2 },
        { nonce: 0, kind: 0, vertical: 2, horizontal: 2 },
      )
      .call();
    console.log(res);
  };

  useEffect(() => {
    console.log(selectedSession);
  }, [selectedSession]);

  return (
    <Flex direction={"column"} gap={"15px"} alignItems={"center"}>
      {/*<Text>{gameStatus(sessionStatus)}</Text>*/}
      <Text fontSize={"24px"} fontWeight={"700"}>
        One pitch to win the game
      </Text>
      <Text fontSize={"18px"} fontWeight={"500"}>
        1. Select the type of swing
      </Text>
      <Flex justifyContent={"center"} gap={"20px"}>
        <Flex
          className={kind === 0 ? styles.activeChoice : styles.inactiveChoice}
          onClick={sessionStatus.didBatterCommit ? undefined : () => setKind(0)}
          cursor={sessionStatus.didBatterCommit ? "default" : "pointer"}
        >
          {swingKind[0]}
        </Flex>
        <Flex
          className={kind === 1 ? styles.activeChoice : styles.inactiveChoice}
          onClick={sessionStatus.didBatterCommit ? undefined : () => setKind(1)}
          cursor={sessionStatus.didBatterCommit ? "default" : "pointer"}
        >
          {swingKind[1]}
        </Flex>
        <Flex
          className={kind === 2 ? styles.activeChoice : styles.inactiveChoice}
          onClick={sessionStatus.didBatterCommit ? undefined : () => setKind(2)}
          cursor={sessionStatus.didBatterCommit ? "default" : "pointer"}
        >
          {swingKind[2]}
        </Flex>
      </Flex>
      <Text fontSize={"18px"} fontWeight={"500"}>
        2. Choose where to swing
      </Text>
      <GridComponent
        selectedIndex={gridIndex}
        setSelectedIndex={sessionStatus.didBatterCommit ? undefined : setGridIndex}
      />
      <Text fontSize={"18px"} fontWeight={"500"}>
        3. Generate randomness
      </Text>
      {!seed && movements.length === 0 && !sessionStatus.didBatterCommit && (
        <button className={globalStyles.commitButton} onClick={handleGenerate}>
          Generate
        </button>
      )}
      {!seed && movements.length === 0 && sessionStatus.didBatterCommit && (
        <Flex
          w="180px"
          h="31px"
          alignItems={"center"}
          justifyContent={"center"}
          bg="#4D4D4D"
          onClick={handleGenerate}
          border={"#767676"}
        >
          Generated
        </Flex>
      )}
      {movements.length > 0 && sessionStatus.progress === 3 && !sessionStatus.didBatterCommit && (
        <Flex
          onClick={() => window.removeEventListener("mousemove", handleMouseMove)}
          w={"180px"}
          h={"31px"}
          border={"1px solid white"}
        >
          <Box w={`${(movements.length / 500) * 100}%`} bg={"green"} />
          <Box bg={"gray"} />
        </Flex>
      )}
      {seed && status !== "TO_REVEAL" && (
        <>
          <button className={globalStyles.commitButton} onClick={handleCommit}>
            Commit
          </button>
        </>
      )}
      {!sessionStatus.didBatterReveal ? (
        <button
          className={globalStyles.commitButton}
          onClick={handleReveal}
          disabled={sessionStatus.progress !== 4}
        >
          Reveal
        </button>
      ) : (
        <Flex className={globalStyles.commitButton}>Revealed</Flex>
      )}
    </Flex>
  );
};

export default BatterView2;
