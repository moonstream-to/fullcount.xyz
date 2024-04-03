import { AtBat } from "../../types";
import styles from "./TeamsView.module.css";
import TeamView from "./TeamView";
import { getTeams } from "./teams";

const TeamsView = ({
  atBats,
  isPitching,
  stats,
  isStatsLoading,
}: {
  atBats: AtBat[];
  isPitching: boolean;
  stats: Record<string, number> | undefined;
  isStatsLoading: boolean;
}) => {
  const teams = getTeams();

  return (
    <div className={styles.container}>
      {teams.map((team, idx) => (
        <TeamView
          isStatsLoading={isStatsLoading}
          stats={stats}
          key={idx}
          isPitching={isPitching}
          atBats={atBats
            .filter((atBat) =>
              team.roster.some(
                (token) =>
                  token.isPitcher === isPitching &&
                  token.tokens.some(
                    (t) =>
                      (t.address === atBat.pitcher?.address && t.id === atBat.pitcher.id) ||
                      (t.address === atBat.batter?.address && t.id === atBat.batter.id),
                  ),
              ),
            )
            .filter((atBat) => atBat.progress === 2)}
          team={team}
        />
      ))}
    </div>
  );
};

export default TeamsView;
