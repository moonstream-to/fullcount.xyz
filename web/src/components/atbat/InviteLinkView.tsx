import styles from "./InviteLinkView.module.css";
import { AtBatStatus } from "../../types";
import { Image } from "@chakra-ui/react";
import QuestionMarkIcon from "../icons/QuestionMarkIcon";
import BallIconWhite from "../icons/BallIconWhite";
import BatIconWhite from "../icons/BatIconWhite";

const InviteLinkView = ({ atBat }: { atBat: AtBatStatus }) => {
  return (
    <div className={styles.container}>
      <div className={styles.tokens}>
        {atBat.pitcher ? (
          <div className={styles.player}>
            <Image alt={atBat.pitcher.name} src={atBat.pitcher.image} />
            <BallIconWhite className={styles.ball} />
          </div>
        ) : (
          <div className={styles.opponent}>
            <QuestionMarkIcon />
            <BallIconWhite className={styles.ball} />
          </div>
        )}
        <div className={styles.vs}>VS</div>
        {atBat.batter ? (
          <div className={styles.player}>
            <Image alt={atBat.batter.name} src={atBat.batter.image} />
            <BatIconWhite className={styles.bat} />
          </div>
        ) : (
          <div className={styles.opponent}>
            <QuestionMarkIcon />
            <BatIconWhite className={styles.bat} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteLinkView;
