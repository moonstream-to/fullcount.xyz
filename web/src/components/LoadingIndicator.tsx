import React from "react";
import styles from "./LoadingIndicator.module.css";
import { FULLCOUNT_ASSETS_PATH } from "../constants";
const src = `${FULLCOUNT_ASSETS_PATH}/ball2.png`;
const LoadingIndicator = () => {
  return (
    <div className={styles.imageRow}>
      <img className={`${styles.animatedImage} ${styles.image1}`} src={src} alt="o" />
      <img className={`${styles.animatedImage} ${styles.image2}`} src={src} alt="o" />
      <img className={`${styles.animatedImage} ${styles.image3}`} src={src} alt="o" />
    </div>
  );
};

export default LoadingIndicator;
