import Image from "next/image";

import styles from "../tokens/CreateNewCharacter.module.css";
import localStyles from "./OnboardingCharacter.module.css";
import React from "react";
import { blbImageSmall } from "../../constants";
import { useGameContext } from "../../contexts/GameContext";
const NUMBER_OF_IMAGES = 8;

const images: number[] = [];
for (let i = 0; i < NUMBER_OF_IMAGES; i += 1) {
  images.push(i);
}

const OnboardingCharacter = ({ onClose }: { onClose: () => void }) => {
  const { updateContext, onboardingName, onboardingImageIdx } = useGameContext();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onClose();
    }
  };
  return (
    <div className={localStyles.container}>
      <div className={styles.content}>
        <Image width={"161"} height={"161"} src={blbImageSmall(onboardingImageIdx)} alt={""} />
        <div className={styles.images}>
          {images.map((_, idx: number) => (
            <Image
              key={idx}
              width={"50"}
              height={"50"}
              alt={`img${idx}`}
              src={blbImageSmall(idx)}
              className={onboardingImageIdx === idx ? styles.selectedImage : styles.image}
              onClick={() => updateContext({ onboardingImageIdx: idx })}
            />
          ))}
        </div>
        <div className={styles.hint}>Choose an image.</div>
        <input
          type={"text"}
          id={"name"}
          placeholder={"Enter name"}
          value={onboardingName}
          onChange={(e) => updateContext({ onboardingName: e.target.value })}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={localStyles.input}
        />
      </div>
      <div className={styles.buttonsContainer}>
        <button
          disabled={!onboardingName || onboardingImageIdx === -1}
          className={
            !onboardingName || onboardingImageIdx === -1
              ? localStyles.inactiveButton
              : localStyles.button
          }
          onClick={onClose}
        >
          Bat
        </button>
      </div>
    </div>
  );
};

export default OnboardingCharacter;
