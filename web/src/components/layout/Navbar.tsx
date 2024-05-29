import { Image } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import styles from "./Navbar.module.css";
import useUser from "../../contexts/UserContext";
import AccountMobile from "../icons/AccountMobile";
import MoreHorizontal from "../icons/MoreHorizontal";
import useLogout from "../../hooks/useLogout";
import { FEEDBACK_FORM_URL, FULLCOUNT_ASSETS_PATH } from "../../constants";
import { setAppStorageItem } from "../../utils/localStorage";
import { useGameContext } from "../../contexts/GameContext";
import router from "next/router";
import VolumeOn from "../icons/VolumeOn";
import SoundFxSlider from "./SoundFxSlider";
import VolumeOffIcon from "../icons/VolumeOffIcon";
import { useSound } from "../../hooks/useSound";

const Navbar = () => {
  const { user } = useUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isSoundSliderOpen, setIsSoundSliderOpen] = useState(false);
  const soundSliderRef = useRef<HTMLDivElement>(null);

  const { soundVolume } = useGameContext();
  const playSound = useSound();

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
      event.stopPropagation();
    }
  };
  const handleClickOutsideSlider = (event: MouseEvent) => {
    if (soundSliderRef.current && !soundSliderRef.current.contains(event.target as Node)) {
      setIsSoundSliderOpen(false);
      event.stopPropagation();
    }
  };

  const { joinedNotification, updateContext } = useGameContext();
  const handleNotificationClick = () => {
    playSound("menuItem");
    setAppStorageItem("joinedNotification", !joinedNotification);
    updateContext({ joinedNotification: !joinedNotification });
  };

  const handleLeaderboardClick = () => {
    playSound("menuItem");
    // sendReport('Leaderboards', {}, ["type:click","click:leaderboards"])
    router.push("/leaderboards");
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside, true);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isSoundSliderOpen) {
      document.addEventListener("click", handleClickOutsideSlider, true);
    }
    return () => {
      document.removeEventListener("click", handleClickOutsideSlider, true);
    };
  }, [isSoundSliderOpen]);

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
        {user && (
          <div className={styles.account}>
            <AccountMobile />
            <div className={styles.username}>{user.username}</div>
          </div>
        )}
        {/*<div className={styles.menuButton}>*/}
        {/*  <VolumeOn />*/}
        {/*</div>*/}
        <div className={styles.menu}>
          <div
            className={styles.menuButton}
            onClick={() => {
              playSound("menuButton");
              setIsSoundSliderOpen(!isSoundSliderOpen);
            }}
          >
            {soundVolume === 0 ? <VolumeOffIcon /> : <VolumeOn />}
          </div>
          {isSoundSliderOpen && <div className={styles.overlay}></div>}
          {isSoundSliderOpen && (
            <div ref={soundSliderRef} className={styles.soundSlider}>
              <SoundFxSlider />
            </div>
          )}
        </div>
        <div className={styles.menu}>
          <div
            className={styles.menuButton}
            onClick={() => {
              playSound("menuButton");
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <MoreHorizontal />
          </div>
          {isMenuOpen && <div className={styles.overlay}></div>}
          {isMenuOpen && (
            <div ref={menuRef} className={styles.menuList}>
              {/*<div className={styles.menuItem}>About</div>*/}
              {/*<div className={styles.menuItem}>Achievements</div>*/}
              <div className={styles.menuItem} onClick={handleLeaderboardClick}>
                Leaderboards
              </div>
              <div
                className={styles.menuItem}
                onClick={handleNotificationClick}
              >{`Notifications - ${joinedNotification ? "on" : "off"}`}</div>
              <div
                className={styles.menuItem}
                onClick={() => {
                  playSound("menuItem");
                  window.open(FEEDBACK_FORM_URL, "_blank", "noopener,noreferrer");
                }}
              >
                Leave feedback
              </div>
              <div className={styles.divider} />
              <div
                className={styles.menuItem}
                onClick={() => {
                  playSound("menuItem");
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
