import { AtBat } from "../../types";
import styles from "./TeamsView.module.css";
import TeamView from "./TeamView";
import { getTeams } from "./teams";

const TeamsView = ({ atBats, isPitching }: { atBats: AtBat[]; isPitching: boolean }) => {
  const teams = getTeams();

  return (
    <div className={styles.container}>
      {teams.map((team, idx) => (
        <TeamView
          key={idx}
          isPitching={isPitching}
          atBats={atBats.filter(
            (atBat) =>
              atBat.progress === 2 &&
              team.roster.some(
                (token) =>
                  token.isPitcher === isPitching &&
                  token.tokens.some(
                    (t) =>
                      (t.address === atBat.pitcher?.address && t.id === atBat.pitcher.id) ||
                      (t.address === atBat.batter?.address && t.id === atBat.batter.id),
                  ),
              ),
          )}
          team={team}
        />
      ))}
    </div>
  );
};

export default TeamsView;
