import { Image } from "@chakra-ui/react";
import styles from "./Outcome2.module.css";
import { AtBatStatus, SessionStatus, Token } from "../../types";
import OutcomeGrid from "./OutcomeGrid";
import React, { useEffect } from "react";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";

export const sessionOutcomeType = (
  tokens: Token[],
  atBat: AtBatStatus,
  sessionStatus: SessionStatus,
): "positive" | "negative" | "neutral" | undefined => {
  const { pitcher, batter } = atBat;
  if (sessionStatus.outcome === 3) {
    return "neutral";
  }
  if (tokens.some((t) => t.address === pitcher?.address && t.id === pitcher.id)) {
    return sessionStatus.outcome === 0 || atBat.outcome === 7 ? "positive" : "negative";
  }
  if (tokens.some((t) => t.address === batter?.address && t.id === batter.id)) {
    return atBat.outcome === 0 || atBat.outcome === 7 ? "negative" : "positive";
  }
};

const kinds = ["Contact", "Power", "Take"];
const speeds = ["Fast", "Slow"];
const columnCenters = [9.5, 36.5, 69.5, 102.5, 129.5].map((x) => x + 85);
const rowCenters = [9.5, 40.0, 80.0, 120.0, 150.5];

const Outcome2 = ({
  atBat,
  sessionStatus,
}: {
  atBat: AtBatStatus;
  sessionStatus: SessionStatus;
}) => {
  useEffect(() => {
    console.log(sessionStatus);
  }, [sessionStatus]);
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageContainerPitcher}>
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
        {sessionStatus.batterReveal.kind !== "2" && (
          <Image
            src={`${FULLCOUNT_ASSETS_PATH}/bat.png`}
            alt={"o"}
            left={`${columnCenters[Number(sessionStatus.batterReveal.horizontal)] - 145}px`}
            top={`${rowCenters[Number(sessionStatus.batterReveal.vertical)] - 15}px`}
            className={styles.batImage}
          />
        )}
        <OutcomeGrid
          pitchReveal={sessionStatus.pitcherReveal}
          swingReveal={sessionStatus.batterReveal}
        />
        <div className={styles.imageContainerBatter}>
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
          <div className={styles.actionType}>{kinds[Number(sessionStatus.batterReveal.kind)]}</div>
        </div>
      </div>
    </div>
  );
};

export default Outcome2;
