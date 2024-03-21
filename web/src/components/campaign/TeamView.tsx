import styles from "./TeamsView.module.css";
import { AtBat } from "../../types";
import { Team } from "./TeamsView";
import Character from "./Character";

const TeamView = ({
  team,
  isPitching,
  atBats,
}: {
  team: Team;
  isPitching: boolean;
  atBats: AtBat[];
}) => {
  if (atBats.length < 1) {
    return <></>;
  }
  return (
    <div className={styles.team}>
      <div className={styles.teamTitle}>{team.title}</div>
      <div className={styles.teamMotto} style={{ color: team.color }}>
        {team.motto}
      </div>
      <div className={styles.teamTokenCards}>
        {team.roster
          .filter((c) => c.isPitcher === isPitching)
          .map((character) => {
            return {
              token: character.tokens.find((token) =>
                atBats.some(
                  (atBat) =>
                    (atBat.batter?.id === token.id && atBat.batter.address === token.address) ||
                    (atBat.pitcher?.id === token.id && atBat.pitcher.address === token.address),
                ),
              ),
              character,
            };
          })
          .map((character, idx) => (
            <Character
              key={idx}
              color={team.color}
              character={character}
              atBat={atBats.find(
                (atBat) =>
                  (atBat.batter?.id === character?.token?.id &&
                    atBat.batter?.address === character?.token?.address) ||
                  (atBat.pitcher?.id === character?.token?.id &&
                    atBat.pitcher?.address === character?.token?.address),
              )}
            />
          ))}
      </div>
    </div>
  );
};

export default TeamView;
