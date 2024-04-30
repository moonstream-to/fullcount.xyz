import styles from "./LeaderboardLayout.module.css";
import Navbar from "../layout/Navbar";
import { ReactNode } from "react";
import { useMediaQuery } from "@chakra-ui/react";
import ArrowLeft from "../icons/ArrowLeft";
import router from "next/router";
import { useSound } from "../../hooks/useSound";

const LeaderboardLayout = ({ children }: { children: ReactNode }) => {
  const [isWideView] = useMediaQuery(["(min-width: 768px)"]);
  const playSound = useSound();
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.navbarContainer}>
          <Navbar />
        </div>
        <div
          className={styles.homeButton}
          onClick={() => {
            playSound("homeButton");
            router.push("/");
          }}
        >
          <ArrowLeft />
          Home page
        </div>
        <img
          src={
            isWideView
              ? "https://static.fullcount.xyz/web/banners/leaderboards-banner-2.jpg"
              : "https://static.fullcount.xyz/web/banners/leaderboards-banner-2-sm.png"
          }
          alt=""
        />
        {children}
      </div>
    </div>
  );
};

export default LeaderboardLayout;
