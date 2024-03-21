import { AtBat } from "../../types";
import styles from "./TeamsView.module.css";
import TeamView from "./TeamView";

interface Token {
  address: string;
  id: string;
}

export interface Character {
  name: string;
  quote: string;
  tokens: Token[];
  isPitcher: boolean;
}

export interface Team {
  title: string;
  motto: string;
  color: string;
  roster: Character[];
}

const TeamsView = ({ atBats, isPitching }: { atBats: AtBat[]; isPitching: boolean }) => {
  const getTeams = () => {
    const captainCook = {
      name: "Captain Hook",
      quote: "His curveball will shiver your timbers.",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "1" }],
      isPitcher: true,
    };
    const edward = {
      name: "Edward “Balkbeard” Heat",
      quote: "Known for his arsenal of deadly cannonballs. ",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "2" }],
      isPitcher: true,
    };

    const star = {
      name: "The Throwing Star",
      quote: "Flings destruction with deadly aim.\n",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "3" }],
      isPitcher: true,
    };
    const ninja = {
      name: "The Smoke Bomb Ninja",
      quote: "When his arm’s on fire, you must realize… Smoke gets in your eyes",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "10" }],
      isPitcher: true,
    };
    const sasquatch = {
      name: "Sasquatch",
      quote: "Squatch out for his fastball.",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "14" }],
      isPitcher: true,
    };
    const frogman = {
      name: "The Loveland Frogman",
      quote: "Hobbies: Chillin’ and catchin’ flies.",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "8" }],
      isPitcher: false,
    };
    const ballbarossa = {
      name: "Ballbarossa",
      quote: "Has a good eye and a great eyepatch.",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "6" }],
      isPitcher: false,
    };
    const silver = {
      name: "Long Ball Silver",
      quote: "Chicks dig the long ball.",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "12" }],
      isPitcher: false,
    };
    const nunchucks = {
      name: "The Nunchucks Annihilator",
      quote: " His batting’s off the chain.\n",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "15" }],
      isPitcher: false,
    };
    const bo = {
      name: "The Bo Staff Battler",
      quote: "Can deflect any pitch. Bo knows baseball. ",
      tokens: [{ address: "0xD3F58aF413b76d754c6cD19266a55475a5a6CA79", id: "7" }],
      isPitcher: false,
    };

    const cryptids = {
      title: "Canny Valley Cryptids",
      motto: "A truly unsettling foe",
      color: "#C9904D",
      roster: [sasquatch, frogman],
    };
    const pirates = {
      title: "Plattsburgh Pirates",
      motto: "They’ll  plunder your stats and scuttle your record",
      color: "#83473C",
      roster: [captainCook, edward, ballbarossa, silver],
    };
    const ninjas = {
      title: "Nagano Ninjas",
      motto: "The lean, mean, unseen baseball team",
      color: "#327484",
      roster: [star, ninja, nunchucks, bo],
    };
    return [pirates, ninjas, cryptids];
  };

  const teams = getTeams();

  return (
    <div className={styles.container}>
      {teams.map((team, idx) => (
        <TeamView
          key={idx}
          isPitching={isPitching}
          atBats={atBats.filter((atBat) =>
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
