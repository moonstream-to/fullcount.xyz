import styles from "./MadeBy.module.css";
import MoonstreamLogo from "../icons/MoonstreamLogo";

const MadeBy = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.text}>made by</div>
        <MoonstreamLogo />
      </div>
    </div>
  );
};

export default MadeBy;
