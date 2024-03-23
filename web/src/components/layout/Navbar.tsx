import { useMediaQuery, useDisclosure, Image } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import styles from "./Navbar.module.css";
import useUser from "../../contexts/UserContext";
import FullcountLogoSmall from "../icons/FullcountLogoSmall";
import AccountMobile from "../icons/AccountMobile";
import VolumeOn from "../icons/VolumeOn";
import MoreHorizontal from "../icons/MoreHorizontal";
import useLogout from "../../hooks/useLogout";
import { FEEDBACK_FORM_URL, FULLCOUNT_ASSETS_PATH } from "../../constants";

const Navbar = () => {
  const [isSmallScreen, isMediumScreen] = useMediaQuery([
    "(max-width: 767px)",
    "(min-width: 1024px)",
  ]);
  const { user } = useUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref for the menu element, typed as HTMLDivElement

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
      event.stopPropagation();
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside, true);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isMenuOpen]);

  const { logout, isLoading: isLoggingOut } = useLogout();

  return (
    <div className={styles.container}>
      <Image
        w={"30px"}
        h={"31px"}
        alt={""}
        src={`${FULLCOUNT_ASSETS_PATH}/logo/fullcount-mini.png`}
      />
      <div className={styles.rightSide}>
        <div className={styles.account}>
          <AccountMobile />
          <div className={styles.username}>{user.username}</div>
        </div>
        {/*<div className={styles.menuButton}>*/}
        {/*  <VolumeOn />*/}
        {/*</div>*/}
        <div className={styles.menu}>
          <div className={styles.menuButton} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MoreHorizontal />
          </div>
          {isMenuOpen && <div className={styles.overlay}></div>}
          {isMenuOpen && (
            <div ref={menuRef} className={styles.menuList}>
              {/*<div className={styles.menuItem}>About</div>*/}
              {/*<div className={styles.menuItem}>Achievements</div>*/}
              {/*<div className={styles.menuItem}>Leaderboards</div>*/}
              <div
                className={styles.menuItem}
                onClick={() => {
                  window.open(FEEDBACK_FORM_URL, "_blank", "noopener,noreferrer");
                }}
              >
                Leave feedback
              </div>
              <div className={styles.divider} />
              <div
                className={styles.menuItem}
                onClick={() => {
                  if (!isLoggingOut) {
                    logout();
                  }
                }}
              >
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
