import styles from "./CampaignView.module.css";
import PlayerStat from "./PlayerStat";
import { AtBat } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import { useState } from "react";
import TeamsView from "./TeamsView";

const CampaignView = ({ atBats }: { atBats: AtBat[] }) => {
  const { selectedToken } = useGameContext();
  const [isPitching, setIsPitching] = useState(true);
  return (
    <div className={styles.container}>
      {selectedToken && <PlayerStat token={selectedToken} />}
      <div className={styles.roleSelector}>
        <div
          className={isPitching ? styles.selectedRole : styles.role}
          onClick={() => setIsPitching(true)}
        >
          pitching
        </div>
        <div
          className={!isPitching ? styles.selectedRole : styles.role}
          onClick={() => setIsPitching(false)}
        >
          batting
        </div>
      </div>
      <TeamsView atBats={atBats} isPitching={isPitching} />
    </div>
  );
};

export default CampaignView;
