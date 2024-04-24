import styles from "./ModeSelector.module.css";
import { useGameContext } from "../../contexts/GameContext";
import { sendReport } from "../../utils/humbug";

const modes = [
  {
    title: "pvp",
    hint: "Try your skills against another player. Join an open at-bat (below) or start your own by choosing ‘bat’ or ‘pitch’ above.",
  },
  {
    title: "campaign",
    hint: "Defeat a series of increasingly difficult bot teams to unlock the final boss.",
  },
  {
    title: "Practice",
    hint: "Play against the coach bots to sharpen your skills. Start here if you'd like some practice before taking on a human opponent.",
  },
];

const ModeSelector = () => {
  const { selectedMode, updateContext } = useGameContext();
  const handleClick = (modeIdx: number) => {
    sendReport(`Mode selected: ${modes[modeIdx].title}`, {}, [
      "type:click",
      `click:${modes[modeIdx].title}`,
    ]);
    updateContext({ selectedMode: modeIdx });
  };
  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        {modes.map((m, idx) => (
          <div
            key={idx}
            className={selectedMode === idx ? styles.buttonSelected : styles.button}
            onClick={() => handleClick(idx)}
          >
            {m.title}
          </div>
        ))}
      </div>
      <div className={styles.hint}>{modes[selectedMode].hint}</div>
    </div>
  );
};

export default ModeSelector;
