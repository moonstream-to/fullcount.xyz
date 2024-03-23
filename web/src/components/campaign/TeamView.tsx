import styles from "./TeamsView.module.css";
import { AtBat } from "../../types";
import CharacterCard from "./CharacterCard";
import { Team } from "./teams";

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
    <div className={styles.team} style={{ backgroundColor: team.isBosses ? "#382D1D" : "#FFF" }}>
      {isPitching && team.isBosses && <div className={styles.bossesTitle}>PITCHING BOSS</div>}
      {!isPitching && team.isBosses && <div className={styles.bossesTitle}>BATTING BOSS</div>}

      <div className={styles.teamTitle} style={{ color: team.isBosses ? "#FFF" : "#262019" }}>
        {team.title}
      </div>
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
            <CharacterCard
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
