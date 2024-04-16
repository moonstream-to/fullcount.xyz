import styles from "./LeaderboardLayout.module.css";
import Navbar from "../layout/Navbar";
import { ReactNode } from "react";

const LeaderboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.container}>
      <div className={styles.navbarContainer}>
        <Navbar />
      </div>
      <img
        src="https://static.fullcount.xyz/web/banners/leaderboards-banner-2-sm.png"
        alt="Description of the image content"
      />
      {children}
    </div>
  );
};

export default LeaderboardLayout;
