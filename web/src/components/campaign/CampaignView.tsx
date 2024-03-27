import styles from "./CampaignView.module.css";
import PlayerStat from "./PlayerStat";
import { AtBat } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import { useState } from "react";
import TeamsView from "./TeamsView";
import { useQuery } from "react-query";
import { GAME_CONTRACT } from "../../constants";
import {
  CAMPAIGN_BOTS_ADDRESS,
  getAllBattersIds,
  getAllPitchersIds,
  getCharacterName,
} from "./teams";
import axios from "axios";

const CampaignView = ({ atBats }: { atBats: AtBat[] }) => {
  const { selectedToken } = useGameContext();
  const [isPitching, setIsPitching] = useState(true);

  const stats = useQuery(["stats", selectedToken?.id, selectedToken?.address], async () => {
    if (!selectedToken) {
      return undefined;
    }
    const fullcountAddress = GAME_CONTRACT;
    const botsAddress = CAMPAIGN_BOTS_ADDRESS;
    const playerTokenId = selectedToken.id;
    const playerAddress = selectedToken.address;

    let batterUrl = `https://api.fullcount.xyz/batter_campaign_results?fullcount_address=${fullcountAddress}&bots_address=${botsAddress}&batter_address=${playerAddress}&batter_token_id=${playerTokenId}`;
    const pitcherTokenIds = getAllPitchersIds();
    pitcherTokenIds.forEach((id) => {
      batterUrl += `&pitcher_token_ids=${id}`;
    });
    let pitcherUrl = `https://api.fullcount.xyz/pitcher_campaign_results?fullcount_address=${fullcountAddress}&bots_address=${botsAddress}&pitcher_address=${playerAddress}&pitcher_token_id=${playerTokenId}`;
    const batterTokenIds = getAllBattersIds();
    batterTokenIds.forEach((id) => {
      pitcherUrl += `&batter_token_ids=${id}`;
    });

    const batterCampaignWins = await axios
      .get(batterUrl)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    const pitcherCampaignWins = await axios
      .get(pitcherUrl)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    console.log(batterCampaignWins, pitcherCampaignWins);
    const stats: Record<string, number> = {};
    const data: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, "5": 0 };
    Object.keys(data).forEach((c) => (stats[getCharacterName(c) ?? "error"] = data[c]));
    return stats;
    // return [
    //   { label: "Pitching", finished: 1, total: 5 },
    //   { label: "Batting", finished: 0, total: 5 },
    //   { label: "Total at-bats", finished: 89 },
    // ];
  });

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
      <TeamsView stats={stats.data} atBats={atBats} isPitching={isPitching} />
    </div>
  );
};

export default CampaignView;
