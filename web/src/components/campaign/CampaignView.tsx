import styles from "./CampaignView.module.css";
import PlayerStat from "./PlayerStat";
import { AtBat } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import TeamsView from "./TeamsView";
import { useQuery } from "react-query";
import { FULLCOUNT_API, GAME_CONTRACT } from "../../constants";
import {
  CAMPAIGN_BOTS_ADDRESS,
  getAllBatters,
  getAllBattersIds,
  getAllPitchers,
  getAllPitchersIds,
  getCharacterName,
} from "./teams";
import axios from "axios";
import { useSound } from "../../hooks/useSound";

const CampaignView = ({ atBats }: { atBats: AtBat[] }) => {
  const { selectedToken, isPitchingInCampaign, updateContext } = useGameContext();
  const playSound = useSound();

  const stats = useQuery(
    ["stats", selectedToken?.id, selectedToken?.address],
    async () => {
      if (!selectedToken) {
        return undefined;
      }
      const fullcountAddress = GAME_CONTRACT;
      const botsAddress = CAMPAIGN_BOTS_ADDRESS;
      const playerTokenId = selectedToken.id;
      const playerAddress = selectedToken.address;

      let batterUrl = `${FULLCOUNT_API}/batter_campaign_results?fullcount_address=${fullcountAddress}&bots_address=${botsAddress}&batter_address=${playerAddress}&batter_token_id=${playerTokenId}`;
      const pitcherTokenIds = getAllPitchersIds();
      pitcherTokenIds.forEach((id) => {
        batterUrl += `&pitcher_token_ids=${id}`;
      });
      let pitcherUrl = `${FULLCOUNT_API}/pitcher_campaign_results?fullcount_address=${fullcountAddress}&bots_address=${botsAddress}&pitcher_address=${playerAddress}&pitcher_token_id=${playerTokenId}`;
      const batterTokenIds = getAllBattersIds();
      batterTokenIds.forEach((id) => {
        pitcherUrl += `&batter_token_ids=${id}`;
      });

      const batterCampaignWins = await axios
        .get(batterUrl)
        .then((response) => {
          return response.data.wins_against_token_id;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      const pitcherCampaignWins = await axios
        .get(pitcherUrl)
        .then((response) => {
          return response.data.wins_against_token_id;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      const data = [...batterCampaignWins, ...pitcherCampaignWins].reduce((acc, curr) => {
        acc[curr.token_id] = curr.wins;
        return acc;
      }, {});
      const stats: Record<string, number> = {};
      Object.keys(data).forEach((c) => {
        const stat = stats[getCharacterName(c) ?? "error"];
        if (!stat) {
          stats[getCharacterName(c) ?? "error"] = data[c];
        } else {
          stats[getCharacterName(c) ?? "error"] = stats[getCharacterName(c) ?? "error"] + data[c];
        }
      });
      const pitchersCompleted = getAllPitchers().filter(
        (p) => stats[p.name] && stats[p.name] >= 3,
      ).length;
      const battersCompleted = getAllBatters().filter(
        (p) => stats[p.name] && stats[p.name] >= 3,
      ).length;

      return { stats, pitchersCompleted, battersCompleted };
    },
    {
      refetchInterval: 5000,
    },
  );

  return (
    <div className={styles.container}>
      {selectedToken && (
        <PlayerStat
          isStatsLoading={stats.isLoading}
          pitchingCompleted={stats.data?.battersCompleted ?? 0}
          battingCompleted={stats.data?.pitchersCompleted ?? 0}
          token={selectedToken}
        />
      )}
      <div className={styles.roleSelector}>
        <div
          className={isPitchingInCampaign ? styles.selectedRole : styles.role}
          onClick={() => {
            playSound("modeSelector");
            updateContext({ isPitchingInCampaign: true });
          }}
        >
          pitchers
        </div>
        <div
          className={!isPitchingInCampaign ? styles.selectedRole : styles.role}
          onClick={() => {
            playSound("modeSelector");
            updateContext({ isPitchingInCampaign: false });
          }}
        >
          batters
        </div>
      </div>
      <div className={styles.hint}>
        {isPitchingInCampaign
          ? "To defeat a pitcher, you must hit three home runs against them. Defeat them all to finish the campaign!"
          : "To defeat a batter, you must strike them out in only three pitches three times. Defeat them all to finish the campaign!"}
      </div>
      <TeamsView
        isStatsLoading={stats.isLoading}
        stats={stats.data?.stats}
        atBats={atBats}
        isPitching={isPitchingInCampaign}
      />
    </div>
  );
};

export default CampaignView;
