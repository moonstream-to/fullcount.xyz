import { AtBatStatus } from "../../types";

const tips = [
  "Tip: Contact swings are best against fastballs.",
  "Tip: Power swings are best against slow pitches.",
  "Tip: Use your opponent’s heatmap to see where they like to pitch.",
  "Tip: Try to predict the speed and location of the pitch.",
];

import styles from "./AtBatView.module.css";
import { useEffect, useState } from "react";

const Tip = ({ atBat }: { atBat: AtBatStatus }) => {
  const [tip, setTip] = useState("");
  const getTip = (atBat: AtBatStatus) => {
    if (atBat.pitches.length === 2) {
      const idx = atBat.pitches[0].pitcherReveal.speed === "0" ? 0 : 1;
      setTip(tips[idx]);
    }
    if (atBat.pitches.length === 3 || atBat.pitches.length === 4) {
      const idx = atBat.pitches.length - 1;
      setTip(tips[idx]);
    }
    if (atBat.pitches.length === 5) {
      const idx = atBat.pitches[0].pitcherReveal.speed === "0" ? 1 : 0;
      setTip(tips[idx]);
    }

    if (atBat.pitches.length > 5) {
      setTip(tips[Math.floor(Math.random() * 4)]);
    }
  };

  useEffect(() => {
    getTip(atBat);
  }, [atBat.pitches]);
  return <div className={styles.tip}>{tip}</div>;
};

export default Tip;
