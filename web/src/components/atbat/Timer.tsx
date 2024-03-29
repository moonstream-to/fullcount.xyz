import React, { useEffect, useState } from "react";
import styles from "./Timer.module.css";
interface TimerProps {
  start: string; // Start time in Unix timestamp format
  delay: number; // Delay in seconds
  isActive: boolean;
}
const Timer: React.FC<TimerProps> = ({ start, delay, isActive }) => {
  const [timeLeft, setTimeLeft] = useState("0:00");

  useEffect(() => {
    const updateTimer = () => {
      const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
      const endTime = Number(start) + Number(delay);
      const remainingTime = endTime - currentTime;

      if (remainingTime <= 0) {
        setTimeLeft("0:00");
        return;
      }

      const minutes = Math.floor(remainingTime / 60).toString();
      const seconds = (remainingTime % 60).toString().padStart(2, "0");

      setTimeLeft(`${minutes} : ${seconds}`);
    };
    let intervalId: NodeJS.Timer | undefined;
    if (isActive) {
      intervalId = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft("0 : 00");
    }
    return () => clearInterval(intervalId);
  }, [start, delay, isActive]);

  return <div className={styles.container}>{timeLeft}</div>;
};

export default Timer;
