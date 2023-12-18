import { useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Flex, Spinner, Text } from "@chakra-ui/react";

import { useGameContext } from "../../contexts/GameContext";
import Web3Context from "../../contexts/Web3Context/context";
import GridComponent from "./GridComponent";
import useMoonToast from "../../hooks/useMoonToast";
import { SessionStatus } from "./PlayView";
import FullcountABIImported from "../../web3/abi/FullcountABI.json";
import { getRowCol } from "./PlayView";
import { AbiItem } from "web3-utils";
import { signSwing } from "../../utils/signing";
import { sendTransactionWithEstimate } from "../../utils/sendTransactions";
import globalStyles from "../GlobalStyles.module.css";
import styles from "./PlayView.module.css";
import ActionTypeSelector from "./ActionTypeSelector";
import { getSwingDescription } from "../../utils/messages";
import RandomGeneratorMobile from "./RandomGeneratorMobile";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const BatterViewMobile = ({ sessionStatus }: { sessionStatus: SessionStatus }) => {
  const [kind, setKind] = useState(0);
  const [gridIndex, setGridIndex] = useState(12);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const [nonce, setNonce] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const web3ctx = useContext(Web3Context);
  const { selectedSession, contractAddress, selectedToken } = useGameContext();
  const gameContract = new web3ctx.web3.eth.Contract(FullcountABI) as any;
  gameContract.options.address = contractAddress;

  const swingKinds = ["Contact", "Power", "Take"];

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

  useEffect(() => {
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
        setIsCommitted(true);
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

  const typeChangeHandle = (value: number) => {
    if (value !== 2 && gridIndex === -1) {
      setGridIndex(12);
    }
    setKind(value);
    if (value === 2) {
      setGridIndex(-1);
    }
  };

  return (
    <Flex direction={"column"} gap={"15px"} alignItems={"center"} mx={"auto"}>
      <ActionTypeSelector
        types={swingKinds}
        isDisabled={sessionStatus.didBatterCommit}
        selected={kind}
        setSelected={typeChangeHandle}
      />
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
      {!nonce && !sessionStatus.didBatterCommit && (
        <>
          <Text fontSize={"12px"} mb={"-5px"} color={"#bdbdbd"}>
            Tap and rotate to generate swing
          </Text>
          <RandomGeneratorMobile
            isActive={!nonce && !sessionStatus.didBatterCommit}
            onChange={(value: string) => setNonce(value)}
          />
        </>
      )}
      {!!nonce && !sessionStatus.didBatterCommit && !isCommitted && (
        <button
          className={globalStyles.commitButton}
          onClick={handleCommit}
          disabled={!nonce || sessionStatus.didBatterCommit}
        >
          {commitSwing.isLoading ? <Spinner h={"14px"} w={"14px"} /> : <Text>Commit</Text>}
          {showTooltip && <div className={globalStyles.tooltip}>Choose where to swing first</div>}
        </button>
      )}
      {sessionStatus.didBatterCommit &&
        sessionStatus.didPitcherCommit &&
        !sessionStatus.didBatterReveal &&
        !isRevealed && (
          <button className={globalStyles.mobileButton} onClick={handleReveal}>
            {revealSwing.isLoading ? <Spinner h={"14px"} w={"14px"} /> : <Text>Reveal</Text>}
          </button>
        )}
      {sessionStatus.didBatterCommit && !sessionStatus.didPitcherCommit && (
        <Text>Waiting pitcher to commit</Text>
      )}
      {sessionStatus.didBatterReveal && !sessionStatus.didPitcherReveal && (
        <Text>Waiting pitcher to reveal</Text>
      )}
    </Flex>
  );
};

export default BatterViewMobile;
