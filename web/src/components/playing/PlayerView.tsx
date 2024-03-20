import { Flex, Image, Spinner, Text } from "@chakra-ui/react";
import ActionTypeSelector from "./ActionTypeSelector";
import GridComponent from "./GridComponent";
import globalStyles from "../GlobalStyles.module.css";
import styles from "./PlayView.module.css";
import { getPitchDescription, getSwingDescription } from "../../utils/messages";
import { getRowCol, SessionStatus } from "./PlayView";
import React, { useContext, useEffect, useState } from "react";
import { signPitch, signSwing } from "../../utils/signing";
import { getLocalStorageItem, setLocalStorageItem } from "../../utils/localStorage";
import Web3Context from "../../contexts/Web3Context/context";
import { useGameContext } from "../../contexts/GameContext";
import AnimatedMessage from "../AnimatedMessage";
import { OwnedToken } from "../../types";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";

const swingKinds = ["Contact", "Power", "Take"];
const pitchSpeeds = ["Fast", "Slow"];

const PlayerView = ({
  sessionStatus,
  isPitcher,
  commitMutation,
  revealMutation,
  isCommitted,
  isRevealed,
  token,
  isRevealFailed,
}: {
  sessionStatus: SessionStatus;
  isPitcher: boolean;
  commitMutation: any;
  revealMutation: any;
  isCommitted: boolean;
  isRevealed: boolean;
  token: OwnedToken;
  isRevealFailed: boolean;
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
    const commit = {
      nonce,
      actionChoice,
      vertical,
      horizontal,
    };
    const localStorageKey = `fullcount.xyz-${contractAddress}-${sessionStatus.sessionID}-${selectedToken?.id}`;
    setLocalStorageItem(localStorageKey, commit);
    if (selectedToken?.source === "FullcountPlayerAPI") {
      commitMutation.mutate({ sign: undefined, commit });
    } else {
      const signFn = isPitcher ? signPitch : signSwing;
      const sign = await signFn(
        web3ctx.account,
        window.ethereum,
        nonce,
        actionChoice,
        vertical,
        horizontal,
      );
      commitMutation.mutate({ sign });
    }
  };

  useEffect(() => {
    const localStorageKey = `fullcount.xyz-${contractAddress}-${sessionStatus.sessionID}-${selectedToken?.id}`;
    const reveal = getLocalStorageItem(localStorageKey);
    if (reveal) {
      setActionChoice(reveal.actionChoice);
      setGridIndex(reveal.vertical * 5 + reveal.horizontal);
    }
  }, [sessionStatus.sessionID]);

  useEffect(() => {
    console.log(
      isPitcher,
      sessionStatus.progress,
      sessionStatus.didBatterReveal,
      sessionStatus.didPitcherReveal,
      token.source,
    );
    if (isPitcher && sessionStatus.progress === 4 && !sessionStatus.didPitcherReveal) {
      handleReveal();
    }
    if (!isPitcher && sessionStatus.progress === 4 && !sessionStatus.didBatterReveal) {
      handleReveal();
    }
  }, [sessionStatus.progress, sessionStatus.didBatterReveal, sessionStatus.didPitcherReveal]);

  const columnCenters = [1.955, 7.1, 13.48, 19.86, 25.01];
  const rowCenters = [1.955, 7.82, 15.64, 23.46, 29.33];

  return (
    <Flex
      direction={"column"}
      gap={"10px"}
      alignItems={"center"}
      mx={"auto"}
      mb={"15px"}
      height={"100%"}
      justifyContent={"end"}
      width="100%"
    >
      <div
        style={{
          width: "66vh",
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <GridComponent
          selectedIndex={gridIndex}
          isPitcher={isPitcher}
          setSelectedIndex={
            isCommitted || (!isPitcher && actionChoice === 2) ? undefined : setGridIndex
          }
        />
        {!isPitcher && actionChoice !== 2 && gridIndex !== -1 && (
          <Image
            src={`${FULLCOUNT_ASSETS_PATH}/bat.png`}
            alt={"o"}
            left={`calc(19.52vh - 4px - 29.9vh + ${
              columnCenters[gridIndex === -1 ? 0 : getRowCol(gridIndex)[1]]
            }vh + ${getRowCol(gridIndex)[1] * 2}px)`}
            top={`calc(${rowCenters[gridIndex === -1 ? 0 : getRowCol(gridIndex)[0]] - 3.91}vh + ${
              getRowCol(gridIndex)[0] * 2
            }px)`}
            className={styles.batImage}
          />
        )}
        {isPitcher && gridIndex !== -1 && (
          <Image
            src={`${FULLCOUNT_ASSETS_PATH}/ball.png`}
            left={`calc(19.52vh - 4px - 2.25vh + ${
              columnCenters[gridIndex === -1 ? 0 : getRowCol(gridIndex)[1]]
            }vh + ${getRowCol(gridIndex)[1] * 2}px)`}
            top={`calc(${rowCenters[gridIndex === -1 ? 0 : getRowCol(gridIndex)[0]] - 2.25}vh + ${
              getRowCol(gridIndex)[0] * 2
            }px)`}
            className={styles.ballImage}
            alt={"o"}
            draggable={false}
            userSelect={"none"}
          />
        )}
      </div>
      <ActionTypeSelector
        types={isPitcher ? pitchSpeeds : swingKinds}
        isDisabled={isCommitted}
        selected={actionChoice}
        setSelected={typeChangeHandle}
      />
      <div style={{ minHeight: "38px" }}>
        {!isCommitted && (
          <button
            className={globalStyles.commitButton}
            onClick={handleCommit}
            disabled={isCommitted}
          >
            {commitMutation.isLoading ? (
              <Spinner h={"14px"} w={"14px"} />
            ) : (
              <Text>{isPitcher ? "Pitch!" : "Swing!"}</Text>
            )}
            {showTooltip && (
              <div className={globalStyles.tooltip}>{`Choose where to ${
                isPitcher ? "pitch" : "swing"
              } first`}</div>
            )}
          </button>
        )}
        {(token.source === "BLBContract" || isRevealFailed) &&
          sessionStatus.didBatterCommit &&
          sessionStatus.didPitcherCommit &&
          !isRevealed && (
            <button className={globalStyles.mobileButton} onClick={handleReveal}>
              {revealMutation.isLoading ? <Spinner h={"14px"} w={"14px"} /> : <Text>Reveal</Text>}
            </button>
          )}
        {isCommitted &&
          ((!isPitcher && !sessionStatus.didPitcherCommit) ||
            (isPitcher && !sessionStatus.didBatterCommit)) && (
            <div className={globalStyles.waitingMessage}>
              <AnimatedMessage message={"Waiting for opponent"} />
            </div>
          )}
        {isRevealed &&
          ((!isPitcher && !sessionStatus.didPitcherReveal) ||
            (isPitcher && !sessionStatus.didBatterReveal)) && (
            <div className={globalStyles.waitingMessage}>
              <AnimatedMessage message={"Waiting for opponent"} />
            </div>
          )}
      </div>
    </Flex>
  );
};

export default PlayerView;
