import React, { useState, useEffect } from "react";

interface TimerProps {
  start: number; // Start time in Unix timestamp format
  delay: number; // Delay in seconds
}

const Timer: React.FC<TimerProps> = ({ start, delay }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
      const endTime = start + delay;
      const remainingTime = endTime - currentTime;

      if (remainingTime <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const minutes = Math.floor(remainingTime / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (remainingTime % 60).toString().padStart(2, "0");
      setTimeLeft(`${minutes}:${seconds}`);
    };

    // Update timer every second
    const intervalId = setInterval(updateTimer, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [start, delay]);

  return <div>{timeLeft}</div>;
};

export default Timer;
