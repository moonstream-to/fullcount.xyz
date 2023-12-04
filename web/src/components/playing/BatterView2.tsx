import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import globalStyles from "../GlobalStyles.module.css";
import styles from "./PlayView.module.css";
import GridComponent from "./GridComponent";
import { useCallback, useContext, useEffect, useState } from "react";
import { getRowCol, getSwingDescription, swingKind } from "./PlayView";
import { signSwing } from "../Signing";
import Web3Context from "../../contexts/Web3Context/context";
import { useGameContext } from "../../contexts/GameContext";
import { useMutation, useQueryClient } from "react-query";
import useMoonToast from "../../hooks/useMoonToast";
import { SessionStatus } from "./PlayView";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { AbiItem } from "web3-utils";
import { sendTransactionWithEstimate } from "../utils";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const BatterView2 = ({ sessionStatus }: { sessionStatus: SessionStatus }) => {
  const [kind, setKind] = useState(0);
  const [gridIndex, setGridIndex] = useState(-1);
  const [isRevealed, setIsRevealed] = useState(false);
  const [nonce, setNonce] = useState("0");
  const [showTooltip, setShowTooltip] = useState(false);
  const web3ctx = useContext(Web3Context);
  const { selectedSession, contractAddress, selectedToken } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const handleCommit = async () => {
    if (gridIndex === -1 && kind !== 2) {
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return;
    }

    const vertical = kind === 2 ? 0 : getRowCol(gridIndex)[0];
    const horizontal = kind === 2 ? 0 : getRowCol(gridIndex)[1];

    const sign = await signSwing(
      web3ctx.account,
      window.ethereum,
      nonce,
      kind,
      vertical,
      horizontal,
    );
    localStorage.setItem(
      `fullcount.xyz-${contractAddress}-${selectedSession?.sessionID}-${selectedToken?.id}`,
      JSON.stringify({
        nonce,
        kind,
        vertical,
        horizontal,
      }),
    );
    commitSwing.mutate({ sign });
  };

  const handleReveal = async () => {
    const item =
      localStorage.getItem(
        `fullcount.xyz-${contractAddress}-${selectedSession?.sessionID}-${selectedToken?.id}` ?? "",
      ) ?? "";
    const reveal = JSON.parse(item);
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
    const item =
      localStorage.getItem(
        `fullcount.xyz-${contractAddress}-${selectedSession?.sessionID}-${selectedToken?.id}` ?? "",
      ) ?? "";
    if (item) {
      const reveal = JSON.parse(item);
      setKind(reveal.kind);
      setGridIndex(reveal.vertical * 5 + reveal.horizontal);
    }
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

      return sendTransactionWithEstimate(
        web3ctx.account,
        gameContract.methods.commitSwing(selectedSession?.sessionID, sign),
      );
    },
    {
      onSuccess: () => {
        queryClient.refetchQueries("sessions");
        queryClient.refetchQueries("session");
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
      return sendTransactionWithEstimate(
        web3ctx.account,
        gameContract.methods.revealSwing(
          selectedSession?.sessionID,
          nonce,
          kind,
          vertical,
          horizontal,
        ),
      );
    },
    {
      onSuccess: () => {
        setIsRevealed(true);
        queryClient.invalidateQueries("sessions");
        queryClient.refetchQueries("session");
      },
      onError: (e: Error) => {
        toast("Reveal failed." + e?.message, "error");
      },
    },
  );

  return (
    <Flex direction={"column"} gap={"15px"} alignItems={"center"}>
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
          onClick={
            sessionStatus.didBatterCommit
              ? undefined
              : () => {
                  setKind(2);
                  setGridIndex(-1);
                }
          }
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
        isPitcher={false}
        setSelectedIndex={sessionStatus.didBatterCommit || kind === 2 ? undefined : setGridIndex}
      />
      <Text className={globalStyles.gradientText} fontSize={"18px"} fontWeight={"700"}>
        You&apos;re swinging
      </Text>
      <Text className={styles.actionText}>
        {getSwingDescription(kind, getRowCol(gridIndex)[1], getRowCol(gridIndex)[0])}
      </Text>
      <Text fontSize={"18px"} fontWeight={"500"}>
        3. Generate randomness
      </Text>
      <Text className={styles.text}>
        Click on the button below and move mouse until the button is filled in
      </Text>
      {!seed && movements.length === 0 && !sessionStatus.didBatterCommit && (
        <button className={globalStyles.commitButton} onClick={handleGenerate}>
          Generate
        </button>
      )}
      {seed && <Flex className={styles.completedAction}>Generated</Flex>}
      {movements.length > 0 && sessionStatus.progress === 3 && !sessionStatus.didBatterCommit && (
        <Flex
          onClick={() => window.removeEventListener("mousemove", handleMouseMove)}
          w={"180px"}
          h={"31px"}
          border={"1px solid white"}
          position={"relative"}
        >
          <Box w={`${(movements.length / 500) * 100}%`} bg={"green"} />
          <Box bg={"gray"} />
          <Text className={styles.moveMouseTip}>move mouse</Text>
        </Flex>
      )}
      {!sessionStatus.didBatterCommit ? (
        <button
          className={globalStyles.commitButton}
          onClick={handleCommit}
          disabled={!seed || sessionStatus.didBatterCommit}
        >
          {commitSwing.isLoading ? <Spinner h={"14px"} w={"14px"} /> : <Text>Commit</Text>}
          {showTooltip && <div className={globalStyles.tooltip}>Choose where to swing first</div>}
        </button>
      ) : (
        <Flex className={styles.completedAction}>Committed</Flex>
      )}

      {sessionStatus.didBatterReveal || isRevealed ? (
        <Flex className={styles.completedAction}>Revealed</Flex>
      ) : (
        <button
          className={globalStyles.commitButton}
          onClick={handleReveal}
          disabled={sessionStatus.progress !== 4 || sessionStatus.didBatterReveal}
        >
          {revealSwing.isLoading ? <Spinner h={"14px"} w={"14px"} /> : <Text>Reveal</Text>}
        </button>
      )}
      <Text className={styles.text}>
        Once both players have committed their moves, press{" "}
        <span className={styles.textBold}> Reveal</span> to see the outcome
      </Text>
    </Flex>
  );
};

export default BatterView2;
