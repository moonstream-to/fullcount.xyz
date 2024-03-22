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
      {/*{selectedToken && <PlayerStat token={selectedToken} />}*/}
      <div className={styles.roleSelector}>
        <div
          className={isPitching ? styles.selectedRole : styles.role}
          onClick={() => setIsPitching(true)}
        >
          batting
        </div>
        <div
          className={!isPitching ? styles.selectedRole : styles.role}
          onClick={() => setIsPitching(false)}
        >
          pitching
        </div>
      </div>
      <div className={styles.hint}>
        {isPitching
          ? "To defeat a pitcher, you must hit three home runs against them. Defeat them all to finish the campaign!"
          : "To defeat a batter, strike them out in only three pitches. Defeat them all to finish the campaign!"}
      </div>
      <TeamsView atBats={atBats} isPitching={isPitching} />
    </div>
  );
};

export default CampaignView;
