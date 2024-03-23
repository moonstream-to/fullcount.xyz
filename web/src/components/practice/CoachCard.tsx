import styles from "./CoachCard.module.css";
import { Token } from "../../types";

const CoachCard = ({
  token,
  onClick,
  description,
  isPitcher,
}: {
  token: Token;
  onClick: () => void;
  description: string;
  isPitcher: boolean;
}) => {
  return (
    <div className={styles.container}>
      <img alt={""} className={styles.image} src={token.image} />
      <div className={styles.content}>
        <div className={styles.name}>{token.name}</div>
        <div className={styles.description}>{description}</div>
        <div className={styles.button} onClick={onClick}>
          {isPitcher ? "BAT" : "PITCH"}
        </div>
      </div>
    </div>
  );
};

export default CoachCard;
