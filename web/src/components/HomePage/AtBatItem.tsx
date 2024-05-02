import styles from "./AtBatsList.module.css";
import { AtBat, OwnedToken, Token } from "../../types";
import TokenToPlay from "./TokenToPlay";
import DotsCounter from "../sessions/DotsCounter";
import router from "next/router";

export const outcomes = [
  "In Progress",
  "Strikeout",
  "Walk",
  "Single",
  "Double",
  "Triple",
  "Home Run",
  "In Play Out",
];

export const outcomeType = (tokens: Token[], atBat: AtBat): "positive" | "negative" | undefined => {
  const { pitcher, batter } = atBat;
  if (tokens.some((t) => t.address === pitcher?.address && t.id === pitcher.id)) {
    return atBat.outcome === 1 || atBat.outcome === 7 ? "positive" : "negative";
  }
  if (tokens.some((t) => t.address === batter?.address && t.id === batter.id)) {
    return atBat.outcome === 1 || atBat.outcome === 7 ? "negative" : "positive";
  }
};

const AtBatItem = ({ atBat, tokens }: { atBat: AtBat; tokens: OwnedToken[] }) => {
  return (
    <div className={styles.atBatContainer} onClick={() => router.push(`/replays?id=${atBat.id}`)}>
      <div className={styles.cards}>
        {atBat.pitcher ? (
          <TokenToPlay token={atBat.pitcher} isPitcher={true} />
        ) : (
          <div style={{ width: "100px", height: "152px", border: "1px solid #7E8E7F" }} />
        )}
        <div className={styles.vs}>VS</div>
        {atBat.batter ? (
          <TokenToPlay token={atBat.batter} isPitcher={false} />
        ) : (
          <div style={{ width: "100px", height: "152px", border: "1px solid #7E8E7F" }} />
        )}
      </div>
      {atBat.outcome !== 0 ? (
        <div
          className={
            !outcomeType(tokens, atBat)
              ? styles.othersOutcome
              : outcomeType(tokens, atBat) === "positive"
              ? styles.positiveOutcome
              : styles.negativeOutcome
          }
        >
          {outcomes[atBat.outcome]}!
        </div>
      ) : (
        <div className={styles.activeAtBat}>
          <DotsCounter label={"BALL"} count={atBat.balls} capacity={4} />
          <DotsCounter label={"STRIKE"} count={atBat.strikes} capacity={3} />
        </div>
      )}
    </div>
  );
};

export default AtBatItem;
