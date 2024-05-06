import styles from "./NewCharacterButton.module.css";
import PlusIcon from "../icons/PlusIcon";
import { useGameContext } from "../../contexts/GameContext";
import { useSound } from "../../hooks/useSound";

const NewCharacterButton = ({ small }: { small: boolean }) => {
  const { updateContext } = useGameContext();
  const playSound = useSound();

  return (
    <div
      className={small ? styles.containerSmall : styles.container}
      onClick={() => {
        playSound("addCharacter");
        updateContext({ isCreateCharacter: true });
      }}
    >
      {small ? <PlusIcon /> : "+ Create new Beer League Baller"}
    </div>
  );
};

export default NewCharacterButton;
