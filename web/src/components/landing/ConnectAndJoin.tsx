import styles from "./ConnectAndJoin.module.css";
import parentStyles from "./Landing.module.css";
import { DISCORD_LINK, GET_CONNECTED_URL } from "../../constants";

const ConnectAndJoin = () => {
  return (
    <div className={styles.container}>
      <div className={styles.firstBlock}>
        <div className={styles.title}>Be first to receive news and updates</div>

        <button
          className={styles.greenButton}
          onClick={() => window.open(GET_CONNECTED_URL, "_blank", "noopener,noreferrer")}
        >
          Get connected
        </button>
      </div>
      <div className={styles.secondBlock}>
        <div className={styles.message}>
          Join the Fullcount community to find new opponents, talk with fellow players, and share
          your questions and feedback with our team
        </div>

        <button
          className={styles.button}
          onClick={() => window.open(DISCORD_LINK, "_blank", "noopener,noreferrer")}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default ConnectAndJoin;
