import styles from "./LaunchForm.module.css";
import {
  DISCORD_LINK,
  FULLCOUNT_ASSETS,
  HYPERPLAY_LINK,
  TRAILER_LINK,
  TWITTER_LINK,
} from "../constants";
import { useGameContext } from "../contexts/GameContext";
import router from "next/router";
import { sendReport } from "../utils/humbug";
import { useSound } from "../hooks/useSound";
// const buttons = ["PVP", "CAMPAIGN", "PRACTICE"];
const buttons = ["LOG IN", "SIGN UP"];

const LaunchForm = ({ onClose }: { onClose: (isLogging: boolean) => void }) => {
  const playSound = useSound();

  const handleClick = (buttonIdx: number) => {
    playSound("launchButton");
    onClose(buttonIdx === 0);
  };
  const handleDemoClick = () => {
    playSound("launchButton");
    sendReport("Playing demo", {}, ["type:click", "click:play_demo"]);
    router.push("/atbat");
  };

  const handleTrailerClick = () => {
    playSound("launchButton");
    sendReport("Playing trailer", {}, ["type:click", "click:play_trailer"]);
    window.open(TRAILER_LINK, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.container}>
      <div className={styles.demoAndTrailer}>
        <div className={styles.blackButton} onClick={handleDemoClick}>
          PLAY DEMO
        </div>
        <img
          alt={""}
          src={`${FULLCOUNT_ASSETS}/elements/play-trailer-button.jpg`}
          className={styles.trailerButton}
          onClick={handleTrailerClick}
        />
      </div>
      {buttons.map((caption, idx) => (
        <div key={idx} className={styles.greenButton} onClick={() => handleClick(idx)}>
          {caption}
        </div>
      ))}
      <div className={styles.icons}>
        <div className={styles.ourIcons}>
          <img
            className={styles.button}
            alt={"discord"}
            src={`${FULLCOUNT_ASSETS}/icons/discord.svg`}
            onClick={() => window.open(DISCORD_LINK, "_blank", "noopener,noreferrer")}
          />
          <img
            className={styles.button}
            alt={"x"}
            src={`${FULLCOUNT_ASSETS}/icons/x_twitter.svg`}
            onClick={() => window.open(TWITTER_LINK, "_blank", "noopener,noreferrer")}
          />
        </div>
        <div className={styles.divider} />
        <div className={styles.hyperplay}>
          <img
            alt={"hyperplay"}
            className={styles.button}
            style={{ height: "22px" }}
            src={`${FULLCOUNT_ASSETS}/icons/hyperplay-play-white.png`}
            onClick={() => window.open(HYPERPLAY_LINK, "_blank", "noopener,noreferrer")}
          />
        </div>
      </div>
      <a>
        <div className={styles.legalText}>Privacy Policy</div>
      </a>
    </div>
  );
};

export default LaunchForm;
