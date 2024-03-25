import styles from "./HomePage.module.css";
import Roster from "../tokens/Roster";
import { AtBat, OwnedToken } from "../../types";
import ModeSelector from "./ModeSelector";
import PvpView from "./PvpView";
import PracticeView from "./PracticeView";
import CampaignView from "../campaign/CampaignView";
import { useGameContext } from "../../contexts/GameContext";

const HomePage = ({ tokens, atBats }: { tokens: OwnedToken[]; atBats: AtBat[] }) => {
  const { selectedMode } = useGameContext();
  return (
    <div className={styles.container}>
      <Roster tokens={tokens} />
      <ModeSelector />
      {selectedMode === 0 && atBats && <PvpView atBats={atBats} tokens={tokens} />}
      {selectedMode === 1 && atBats && <CampaignView atBats={atBats} />}

      {selectedMode === 2 && atBats && <PracticeView atBats={atBats} />}
    </div>
  );
};

export default HomePage;
