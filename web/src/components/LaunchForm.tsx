import styles from "./LaunchForm.module.css";
import {
  DISCORD_LINK,
  FULLCOUNT_ASSETS,
  HYPERPLAY_LINK,
  TRAILER_LINK,
  TWITTER_LINK,
} from "../constants";
import { useGameContext } from "../contexts/GameContext";
import { useEffect, useState } from "react";
import router from "next/router";
import { sendReport } from "../utils/humbug";
const buttons = ["PVP", "CAMPAIGN", "PRACTICE"];

const LaunchForm = ({ onClose }: { onClose: () => void }) => {
  const { updateContext } = useGameContext();
  const handleClick = (selectedMode: number) => {
    updateContext({ selectedMode });
    onClose();
  };
  const handleDemoClick = () => {
    sendReport("Playing demo", {}, ["type:click", "click:play_demo"]);
    router.push("/atbat");
  };

  const handleTrailerClick = () => {
    sendReport("Playing trailer", {}, ["type:click", "click:play_trailer"]);
    window.open(TRAILER_LINK, "_blank", "noopener,noreferrer");
  };

  const [tgWebApp, setTgWebApp] = useState<any | null>(null);
  useEffect(() => {
    const app = (window as any).Telegram?.WebApp;
    if (app) {
      app.ready();
      setTgWebApp(app);
    }
  }, []);
  const [tgUser, setTgUser] = useState<any | null>(null);
  useEffect(() => {
    const user = tgWebApp?.initDataUnsafe?.user;
    setTgUser(user);
  }, [tgWebApp]);

  return (
    <div className={styles.container}>
      {tgUser ? (
        <div className={styles.footerText}>
          <label>Welcome {tgUser?.username}</label>
        </div>
      ) : (
        <></>
      )}
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
    </div>
  );
};

export default LaunchForm;
