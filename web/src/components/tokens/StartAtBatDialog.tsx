import styles from "./Roster.module.css";
import { useEffect, useRef } from "react";

const StartAtBatDialog = ({
  onClick,
  onClose,
}: {
  onClick: (requireSignature: boolean) => void;
  onClose: () => void;
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
      onClose();
      event.stopPropagation();
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, []);

  return (
    <div className={styles.dialog} ref={dialogRef}>
      <button type={"button"} className={styles.button} onClick={() => onClick(false)}>
        OPEN&nbsp;CHALLENGE
      </button>
      <button type={"button"} className={styles.button} onClick={() => onClick(true)}>
        BY&nbsp;INVITE&nbsp;LINK&nbsp;ONLY
      </button>
    </div>
  );
};

export default StartAtBatDialog;
