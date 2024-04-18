import { Image } from "@chakra-ui/react";
import styles from "./Outcome2.module.css";
import { AtBatStatus, SessionStatus, Token } from "../../types";
import OutcomeGrid from "./OutcomeGrid";
import React, { useEffect } from "react";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { useGameContext } from "../../contexts/GameContext";
import { outcomes, outcomeType } from "./AtBatView";
import Tip from "./Tip";

export const sessionOutcomeType = (
  tokens: Token[],
  atBat: AtBatStatus,
  sessionStatus: SessionStatus,
): "positive" | "negative" | "neutral" | undefined => {
  const { pitcher, batter } = atBat;
  if (tokens.some((t) => t.address === pitcher?.address && t.id === pitcher.id)) {
    return sessionStatus.outcome === 0 || sessionStatus.outcome === 2 || atBat.outcome === 7
      ? "positive"
      : "negative";
  }
  if (tokens.some((t) => t.address === batter?.address && t.id === batter.id)) {
    return sessionStatus.outcome === 0 || sessionStatus.outcome === 2 || atBat.outcome === 7
      ? "negative"
      : "positive";
  }
};

const kinds = ["Contact", "Power", "Take"];
const speeds = ["Fast", "Slow"];
const columnCenters = [1.955, 7.1, 13.48, 19.86, 25.01];
const rowCenters = [1.955, 7.82, 15.64, 23.46, 29.33];

const Outcome2 = ({
  atBat,
  sessionStatus,
  forToken,
  showTips = false,
}: {
  atBat: AtBatStatus;
  sessionStatus: SessionStatus;
  forToken: Token | undefined;
  showTips?: boolean;
}) => {
  const { selectedToken } = useGameContext();
  useEffect(() => {
    console.log(sessionStatus);
  }, [sessionStatus]);
  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        {/*<div className={styles.whiteSpace} />*/}
        <div className={styles.content}>
          {atBat && atBat.outcome !== 0 && forToken && (
            <div
              className={
                !outcomeType([forToken], atBat)
                  ? styles.othersOutcome
                  : outcomeType([forToken], atBat) === "positive"
                  ? styles.positiveOutcome
                  : styles.negativeOutcome
              }
            >
              {outcomes[atBat.outcome]}!
            </div>
          )}
          <div className={styles.pitcher}>
            <div className={styles.imageContainer}>
              {atBat?.pitcher && (
                <Image
                  src={atBat.pitcher?.image}
                  alt={atBat.pitcher?.name}
                  className={
                    sessionOutcomeType([atBat.pitcher], atBat, sessionStatus) === "positive"
                      ? styles.winImage
                      : styles.image
                  }
                />
              )}
              <div className={styles.actionType}>
                {speeds[Number(sessionStatus.pitcherReveal.speed)]}
              </div>
            </div>
          </div>
          {sessionStatus.batterReveal.kind !== "2" && (
            <Image
              src={`${FULLCOUNT_ASSETS_PATH}/bat.png`}
              alt={"o"}
              left={`calc((100vw - 26.96vh) / 2 - 4px - 29.9vh + ${
                columnCenters[Number(sessionStatus.batterReveal.horizontal)]
              }vh + ${Number(sessionStatus.batterReveal.horizontal) * 2}px)`}
              top={`calc(${rowCenters[Number(sessionStatus.batterReveal.vertical)] - 3.91}vh + ${
                Number(sessionStatus.batterReveal.vertical) * 2
              }px)`}
              className={styles.batImage}
            />
          )}
          <Image
            src={`${FULLCOUNT_ASSETS_PATH}/ball.png`}
            left={`calc((100vw - 26.96vh) / 2 - 4px + ${
              columnCenters[Number(sessionStatus.pitcherReveal.horizontal)]
            }vh - 2.25vh + ${Number(sessionStatus.pitcherReveal.horizontal) * 2}px)`}
            top={`calc(${rowCenters[Number(sessionStatus.pitcherReveal.vertical)] - 2.25}vh + ${
              Number(sessionStatus.pitcherReveal.vertical) * 2
            }px)`}
            className={styles.ballImage}
            alt={"o"}
            draggable={false}
            userSelect={"none"}
          />
          <OutcomeGrid
            pitchReveal={sessionStatus.pitcherReveal}
            swingReveal={sessionStatus.batterReveal}
          />
          <div className={styles.batter}>
            <div className={styles.imageContainer}>
              {atBat?.batter && (
                <Image
                  src={atBat.batter?.image}
                  alt={atBat.batter?.name}
                  className={
                    sessionOutcomeType([atBat.batter], atBat, sessionStatus) === "positive"
                      ? styles.winImage
                      : styles.image
                  }
                />
              )}
              <div className={styles.actionType}>
                {kinds[Number(sessionStatus.batterReveal.kind)]}
              </div>
            </div>
          </div>
        </div>

        {/*<div className={styles.whiteSpace} />*/}
      </div>
      {atBat.outcome === 0 && showTips && <Tip atBat={atBat} />}
    </div>
  );
};

export default Outcome2;
