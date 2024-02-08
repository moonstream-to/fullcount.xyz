import { useEffect, useState } from "react";
import styles from "./playing/PlayView.module.css";

const AnimatedMessage = ({ message }: { message: string }) => {
  const [numberOfDots, setNumberOfDots] = useState({ number: 1, trend: "up" });
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNumberOfDots((prevCount) => {
        if (prevCount.number === 1) {
          return { number: 2, trend: "up" };
        } else if (prevCount.number === 3) {
          return { number: 2, trend: "down" };
        } else {
          return {
            number: prevCount.trend === "up" ? 3 : 1,
            trend: "",
          };
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.waitingMessage}>
      {`${message}${".".repeat(numberOfDots.number)}`}
      <span style={{ color: "transparent" }}>{".".repeat(3 - numberOfDots.number)}</span>
    </div>
  );
};

export default AnimatedMessage;
