import { useMediaQuery, useDisclosure } from "@chakra-ui/react";
import Web3Context from "../../contexts/Web3Context/context";
import { useContext, useState } from "react";
import styles from "./Navbar.module.css";
import useUser from "../../contexts/UserContext";
import FullcountLogoSmall from "../icons/FullcountLogoSmall";
import AccountMobile from "../icons/AccountMobile";
import VolumeOn from "../icons/VolumeOn";
import MoreHorizontal from "../icons/MoreHorizontal";
import useLogout from "../../hooks/useLogout";

const Navbar = () => {
  const [isSmallScreen, isMediumScreen] = useMediaQuery([
    "(max-width: 767px)",
    "(min-width: 1024px)",
  ]);
  const { user } = useUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, isLoading: isLoggingOut } = useLogout();

  return (
    <div className={styles.container}>
      <FullcountLogoSmall />
      <div className={styles.rightSide}>
        <div className={styles.account}>
          <AccountMobile />
          <div className={styles.username}>{user.username}</div>
        </div>
        <div className={styles.menuButton}>
          <VolumeOn />
        </div>
        <div className={styles.menu}>
          <div className={styles.menuButton} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MoreHorizontal />
          </div>
          {isMenuOpen && (
            <div className={styles.menuList}>
              <div className={styles.menuItem}>About</div>
              <div className={styles.menuItem}>Achievements</div>
              <div className={styles.menuItem}>Leaderboards</div>
              <div className={styles.menuItem}>Leave feedback</div>
              <div className={styles.divider} />
              <div className={styles.menuItem} onClick={() => logout()}>
                {isLoggingOut ? "logging out..." : "Log out"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
