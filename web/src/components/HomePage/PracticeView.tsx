import styles from "./PvpView.module.css";
import TokenToPlay from "./TokenToPlay";
import { AtBat, OwnedToken } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import { useRouter } from "next/router";
import CoachCard from "../practice/CoachCard";

const BOTS_ADDRESS = "0xbb1dDc1eB50959c4c59b62F3f6Dbf9CbB6156Bc8";
const rachel = ["11", "12", "13"];
const nolan = ["27", "28", "29"];
const rachel2 = ["14", "15", "16"];
const nolan2 = ["30", "31", "32"];

const pitcherDescription =
  "Like her namesake, Rachel Balkovec, this coach bot will turn you into a batting badass (bat-ass?).";
const batterDescription =
  "Named for legendary pitcher Nolan Ryan and legendary contest winner Bryan.";
const getDefault = (team: string[]) => {
  return team[0];
};

const pitchers = [rachel];
const batters = [nolan];
export const isCoach = (address: string, id: string): boolean => {
  const coaches = [...rachel, ...nolan, ...rachel2, ...nolan2];
  if (address !== BOTS_ADDRESS) {
    return false;
  }
  const allPitchers = pitchers.flat();
  const allBatters = batters.flat();
  return allPitchers.includes(id) || allBatters.includes(id) || coaches.includes(id);
};

const PvpView = ({ atBats }: { atBats: AtBat[] }) => {
  const router = useRouter();
  const { updateContext } = useGameContext();
  const handlePlay = (atBat: AtBat) => {
    if (atBat.pitcher) {
      const team = pitchers.find((t) => getDefault(t) === atBat.pitcher?.id);
      if (!team) {
        return;
      }
      const atBatsForPractice = team
        .map((t) =>
          atBats.find((atBat) => atBat.pitcher?.id === t && atBat.pitcher.address === BOTS_ADDRESS),
        )
        .filter((atBat) => atBat);
      updateContext({ atBatsForPractice });
      router.push("/practice");
      return;
    }
    if (atBat.batter) {
      const team = batters.find((t) => getDefault(t) === atBat.batter?.id);
      if (!team) {
        return;
      }
      const atBatsForPractice = team
        .map((t) =>
          atBats.find((atBat) => atBat.batter?.id === t && atBat.batter.address === BOTS_ADDRESS),
        )
        .filter((atBat) => atBat);
      updateContext({ atBatsForPractice });
      router.push("/practice");
      return;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.listsContainer} style={{ justifyContent: "center" }}>
        <div className={styles.list} style={{ maxWidth: "300px" }}>
          <div className={styles.listHeader}>BATTING COACH</div>
          {atBats
            .filter(
              (a) =>
                a.progress === 2 &&
                a.pitcher &&
                a.pitcher?.address === BOTS_ADDRESS &&
                pitchers.some((team) => getDefault(team) === a.pitcher?.id),
            )
            .map((openAtBat, idx) => {
              return openAtBat.pitcher ? (
                <CoachCard
                  token={openAtBat.pitcher}
                  onClick={() => handlePlay(openAtBat)}
                  description={pitcherDescription}
                  isPitcher={true}
                  key={idx}
                />
              ) : (
                <div style={{ width: "130px", height: "225.5px" }} />
              );
            })}
        </div>
        <div className={styles.list} style={{ maxWidth: "300px" }}>
          <div className={styles.listHeader}>Pitching coach</div>
          {atBats
            .filter(
              (a) =>
                a.progress === 2 &&
                a.batter &&
                a.batter?.address == BOTS_ADDRESS &&
                batters.some((team) => getDefault(team) === a.batter?.id),
            )
            .map((openAtBat, idx) => {
              return openAtBat.batter ? (
                <CoachCard
                  token={openAtBat.batter}
                  onClick={() => handlePlay(openAtBat)}
                  description={batterDescription}
                  isPitcher={false}
                  key={idx}
                />
              ) : (
                <div style={{ width: "130px", height: "225.5px" }} />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PvpView;
