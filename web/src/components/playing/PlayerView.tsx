import { Flex, Spinner, Text } from "@chakra-ui/react";
import ActionTypeSelector from "./ActionTypeSelector";
import GridComponent from "./GridComponent";
import globalStyles from "../GlobalStyles.module.css";
import styles from "./PlayView.module.css";
import { getPitchDescription, getSwingDescription } from "../../utils/messages";
import { getRowCol, SessionStatus } from "./PlayView";
import { useContext, useEffect, useState } from "react";
import { signPitch, signSwing } from "../../utils/signing";
import { getLocalStorageItem, setLocalStorageItem } from "../../utils/localStorage";
import Web3Context from "../../contexts/Web3Context/context";
import { useGameContext } from "../../contexts/GameContext";

const swingKinds = ["Contact", "Power", "Take"];
const pitchSpeeds = ["Fast", "Slow"];

const PlayerView = ({
  sessionStatus,
  isPitcher,
  commitMutation,
  revealMutation,
  isCommitted,
  isRevealed,
}: {
  sessionStatus: SessionStatus;
  isPitcher: boolean;
  commitMutation: any;
  revealMutation: any;
  isCommitted: boolean;
  isRevealed: boolean;
}) => {
  const [actionChoice, setActionChoice] = useState(0);
  const [gridIndex, setGridIndex] = useState(-1);
  const [showTooltip, setShowTooltip] = useState(false);
  const { contractAddress, selectedToken } = useGameContext();
  const web3ctx = useContext(Web3Context);

  const getActionDescription = () => {
    if (isPitcher) {
      return getPitchDescription(actionChoice, getRowCol(gridIndex)[1], getRowCol(gridIndex)[0]);
    }
    return getSwingDescription(actionChoice, getRowCol(gridIndex)[1], getRowCol(gridIndex)[0]);
  };

  const typeChangeHandle = (value: number) => {
    setActionChoice(value);
    if (isPitcher) {
      return;
    }
    if (value !== 2 && gridIndex === -1) {
      setGridIndex(12);
    }
    if (value === 2) {
      setGridIndex(-1);
    }
  };

  const handleReveal = async () => {
    const localStorageKey = `fullcount.xyz-${contractAddress}-${sessionStatus.sessionID}-${selectedToken?.id}`;
    const reveal = getLocalStorageItem(localStorageKey);
    revealMutation.mutate(reveal);
  };

  const handleCommit = async () => {
    if (gridIndex === -1) {
      if (isPitcher || actionChoice !== 2) {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
        }, 3000);
        return;
      }
    }
    const vertical = gridIndex === -1 ? 0 : getRowCol(gridIndex)[0];
    const horizontal = gridIndex === -1 ? 0 : getRowCol(gridIndex)[1];
    const nonce = web3ctx.web3.utils.randomHex(32);
    const signFn = isPitcher ? signPitch : signSwing;
    const sign = await signFn(
      web3ctx.account,
      window.ethereum,
      nonce,
      actionChoice,
      vertical,
      horizontal,
    );
    const localStorageKey = `fullcount.xyz-${contractAddress}-${sessionStatus.sessionID}-${selectedToken?.id}`;
    setLocalStorageItem(localStorageKey, {
      nonce,
      actionChoice,
      vertical,
      horizontal,
    });
    commitMutation.mutate({ sign });
  };

  useEffect(() => {
    const localStorageKey = `fullcount.xyz-${contractAddress}-${sessionStatus.sessionID}-${selectedToken?.id}`;
    const reveal = getLocalStorageItem(localStorageKey);
    if (reveal) {
      setActionChoice(reveal.actionChoice);
      setGridIndex(reveal.vertical * 5 + reveal.horizontal);
    }
  }, [sessionStatus.sessionID]);

  return (
    <Flex direction={"column"} gap={"30px"} alignItems={"center"} mx={"auto"}>
      <ActionTypeSelector
        types={isPitcher ? pitchSpeeds : swingKinds}
        isDisabled={isCommitted}
        selected={actionChoice}
        setSelected={typeChangeHandle}
      />
      <GridComponent
        selectedIndex={gridIndex}
        isPitcher={isPitcher}
        setSelectedIndex={
          isCommitted || (!isPitcher && actionChoice === 2) ? undefined : setGridIndex
        }
      />
      <Text className={globalStyles.gradientText} fontSize={"18px"} fontWeight={"700"}>
        {`You're ${isPitcher ? "throwing" : "swinging"}`}
      </Text>
      <Text className={styles.actionText}>{getActionDescription()}</Text>
      {!isCommitted && (
        <button className={globalStyles.commitButton} onClick={handleCommit} disabled={isCommitted}>
          {commitMutation.isLoading ? <Spinner h={"14px"} w={"14px"} /> : <Text>Commit</Text>}
          {showTooltip && <div className={globalStyles.tooltip}>Choose where to swing first</div>}
        </button>
      )}
      {sessionStatus.didBatterCommit && sessionStatus.didPitcherCommit && !isRevealed && (
        <button className={globalStyles.mobileButton} onClick={handleReveal}>
          {revealMutation.isLoading ? <Spinner h={"14px"} w={"14px"} /> : <Text>Reveal</Text>}
        </button>
      )}
      {isCommitted &&
        ((!isPitcher && !sessionStatus.didPitcherCommit) ||
          (isPitcher && !sessionStatus.didBatterCommit)) && (
          <Text className={styles.waitingMessage}>Waiting for opponent to commit...</Text>
        )}
      {isRevealed &&
        ((!isPitcher && !sessionStatus.didPitcherReveal) ||
          (isPitcher && !sessionStatus.didBatterReveal)) && (
          <Text className={styles.waitingMessage}>Waiting for opponent to reveal...</Text>
        )}
    </Flex>
  );
};

export default PlayerView;
