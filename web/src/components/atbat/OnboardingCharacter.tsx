import Image from "next/image";

import styles from "../tokens/CreateNewCharacter.module.css";
import localStyles from "./OnboardingCharacter.module.css";
import React, { useEffect, useState } from "react";
import { blbImage, NUMBER_OF_BLB_IMAGES } from "../../constants";
import { useSound } from "../../hooks/useSound";
const names = [
  "Joe Expo",
  "Playtest Celeste",
  "Preseason Steven",
  "Mike Check",
  "Sample Simon",
  "Demo Demi",
  "Trial Kyle",
  "Drew Preview",
];

const images: number[] = [];
for (let i = 0; i < NUMBER_OF_BLB_IMAGES; i += 1) {
  images.push(i);
}

const OnboardingCharacter = ({
  onClose,
  onChange,
}: {
  onClose: () => void;
  onChange: (name: string, image: string) => void;
}) => {
  const [name, setName] = useState(names[7]);
  const [imageIndex, setImageIndex] = useState(7);
  const playSound = useSound();

  useEffect(() => {
    setName(names[7]);
    setImageIndex(7);
  }, []);

  useEffect(() => {
    onChange(names[imageIndex], blbImage(imageIndex));
  }, [imageIndex, name]);

  return (
    <div className={localStyles.container}>
      <div className={styles.content}>
        <div className={localStyles.title}>
          Choose character
          <br />
          to play demo
        </div>
        <Image width={"161"} height={"161"} src={blbImage(imageIndex)} alt={""} />
        <div className={localStyles.name}>{names[imageIndex]}</div>
        <div className={styles.images}>
          {images.map((_, idx: number) => (
            <Image
              key={idx}
              width={"50"}
              height={"50"}
              alt={`img${idx}`}
              src={blbImage(idx)}
              className={imageIndex === idx ? styles.selectedImage : styles.image}
              onClick={() => {
                playSound("imageSelector");
                setImageIndex(idx);
              }}
            />
          ))}
        </div>
      </div>
      <div className={styles.buttonsContainer}>
        <button
          disabled={!name || imageIndex === -1}
          className={!name || imageIndex === -1 ? localStyles.inactiveButton : localStyles.button}
          onClick={() => {
            playSound("batButton");
            onClose();
          }}
        >
          Bat
        </button>
      </div>
    </div>
  );
};

export default OnboardingCharacter;
