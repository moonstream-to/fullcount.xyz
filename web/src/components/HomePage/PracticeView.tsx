import styles from "./PvpView.module.css";
import TokenToPlay from "./TokenToPlay";
import { AtBat, OwnedToken } from "../../types";
import { useGameContext } from "../../contexts/GameContext";
import { useRouter } from "next/router";

const BOTS_ADDRESS = "0x7cfEd1ae17bf332b604ba7feDD905844a865e7df";
const ALICE_TEAM = [1, 2, 3];
const DORIS_TEAM = [4];
const ALLAN_TEAM = [5];
const DENNY_TEAM = [6, 7, 8];
const getDefault = (team: number[]) => {
  return String(team[0]);
};

const pitchers = [ALICE_TEAM, DORIS_TEAM];
const batters = [ALLAN_TEAM, DENNY_TEAM];

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
        .map((t) => atBats.find((atBat) => atBat.pitcher?.id === String(t)))
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
        .map((t) => atBats.find((atBat) => atBat.batter?.id === String(t)))
        .filter((atBat) => atBat);
      updateContext({ atBatsForPractice });
      router.push("/practice");
      return;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.listsContainer}>
        <div className={styles.list}>
          PITCHERS
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
                <TokenToPlay
                  token={openAtBat.pitcher}
                  isPitcher={true}
                  onClick={() => handlePlay(openAtBat)}
                  key={idx}
                />
              ) : (
                <div style={{ width: "130px", height: "225.5px" }} />
              );
            })}
        </div>
        <div className={styles.list}>
          BATTERS
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
                <TokenToPlay
                  token={openAtBat.batter}
                  isPitcher={false}
                  onClick={() => handlePlay(openAtBat)}
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
