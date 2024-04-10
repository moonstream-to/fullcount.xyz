import Image from "next/image";

import styles from "../tokens/CreateNewCharacter.module.css";
import localStyles from "./OnboardingCharacter.module.css";
import React, { useEffect, useState } from "react";
import { blbImage } from "../../constants";
const NUMBER_OF_IMAGES = 8;

const images: number[] = [];
for (let i = 0; i < NUMBER_OF_IMAGES; i += 1) {
  images.push(i);
}

const OnboardingCharacter = ({
  onClose,
  onChange,
}: {
  onClose: () => void;
  onChange: (name: string, image: string) => void;
}) => {
  const [name, setName] = useState("Guest_0420");
  const [imageIndex, setImageIndex] = useState(7);

  useEffect(() => {
    setName("Guest_0420");
    setImageIndex(7);
  }, []);

  useEffect(() => {
    onChange(name, blbImage(imageIndex));
  }, [imageIndex, name]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onClose();
    }
  };
  return (
    <div className={localStyles.container}>
      <div className={styles.content}>
        <Image width={"161"} height={"161"} src={blbImage(imageIndex)} alt={""} />
        <div className={styles.images}>
          {images.map((_, idx: number) => (
            <Image
              key={idx}
              width={"50"}
              height={"50"}
              alt={`img${idx}`}
              src={blbImage(idx)}
              className={imageIndex === idx ? styles.selectedImage : styles.image}
              onClick={() => setImageIndex(idx)}
            />
          ))}
        </div>
        <div className={styles.hint}>Choose an image.</div>
        <input
          type={"text"}
          id={"name"}
          placeholder={"Enter name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={localStyles.input}
        />
      </div>
      <div className={styles.buttonsContainer}>
        <button
          disabled={!name || imageIndex === -1}
          className={!name || imageIndex === -1 ? localStyles.inactiveButton : localStyles.button}
          onClick={onClose}
        >
          Bat
        </button>
      </div>
    </div>
  );
};

export default OnboardingCharacter;
