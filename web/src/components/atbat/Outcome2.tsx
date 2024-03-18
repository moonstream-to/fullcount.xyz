import { Image } from "@chakra-ui/react";
import styles from "./Outcome2.module.css";
import { AtBatStatus, SessionStatus, Token } from "../../types";
import OutcomeGrid from "./OutcomeGrid";

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

const Outcome2 = ({
  atBat,
  sessionStatus,
}: {
  atBat: AtBatStatus;
  sessionStatus: SessionStatus;
}) => {
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
        </div>
        <OutcomeGrid
          pitchReveal={{ speed: 1, vertical: 1, horizontal: 2 }}
          swingReveal={{ kind: 1, vertical: 3, horizontal: 4 }}
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
        </div>
      </div>
    </div>
  );
};

export default Outcome2;
