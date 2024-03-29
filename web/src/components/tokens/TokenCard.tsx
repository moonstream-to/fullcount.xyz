import styles from "./TokenCard.module.css";
import { OwnedToken } from "../../types";
import Image from "next/image";

const TokenCard = ({
  token,
  isSelected,
  onSelected,
}: {
  token: OwnedToken;
  isSelected: boolean;
  onSelected: () => void;
}) => {
  return (
    <div className={isSelected ? styles.containerSelected : styles.container} onClick={onSelected}>
      <Image
        width={"130"}
        height={130}
        className={styles.image}
        alt={token.name}
        src={token.image}
      />
      <div className={styles.name}>{token.name}</div>
    </div>
  );
};

export default TokenCard;
