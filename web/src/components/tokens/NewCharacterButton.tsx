import styles from "./NewCharacterButton.module.css";
import PlusIcon from "../icons/PlusIcon";
import { useGameContext } from "../../contexts/GameContext";

const NewCharacterButton = ({ small }: { small: boolean }) => {
  const { updateContext } = useGameContext();
  return (
    <div
      className={small ? styles.containerSmall : styles.container}
      onClick={() => {
        updateContext({ isCreateCharacter: true });
      }}
    >
      {small ? <PlusIcon /> : "+ Mint new Beer League Baller"}
    </div>
  );
};

export default NewCharacterButton;
