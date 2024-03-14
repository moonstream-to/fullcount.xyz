import styles from "./HomePage.module.css";
import Roster from "../tokens/Roster";
import { AtBat, OwnedToken } from "../../types";
import ModeSelector from "./ModeSelector";
import { useState } from "react";
import PvpView from "./PvpView";

const HomePage = ({ tokens, atBats }: { tokens: OwnedToken[]; atBats: AtBat[] }) => {
  const [selectedMode, setSelectedMode] = useState(0);
  return (
    <div className={styles.container}>
      <Roster tokens={tokens} />
      <ModeSelector selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
      {selectedMode === 0 && atBats && <PvpView atBats={atBats} tokens={tokens} />}
    </div>
  );
};

export default HomePage;
