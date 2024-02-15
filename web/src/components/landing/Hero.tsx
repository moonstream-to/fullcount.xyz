import styles from "./Landing.module.css";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { Image, useMediaQuery } from "@chakra-ui/react";
import FullcountLogo from "../icons/FullcountLogo";
import Link from "next/link";
const assets = `${FULLCOUNT_ASSETS_PATH}/landing`;

const Hero = () => {
  const [is768View] = useMediaQuery(["(min-width: 768px)"]);
  return (
    <div className={styles.heroContainer}>
      <FullcountLogo />
      <div className={styles.heroInnerContainer}>
        {
          <Image
            w={is768View ? "560px" : "252px"}
            h={is768View ? "252px" : "450px"}
            src={`${assets}/hero-illustration${is768View ? "" : "-sm"}.png`}
          />
        }
        <div className={styles.heroTextContainer}>
          <div className={styles.heroTextTitle}>Become a baseball legend with Fullcount</div>
          {!is768View ? (
            <div className={styles.heroTextText}>
              Experience the epic duel between batter and pitcher in this fully on-chain baseball
              strategy game.
            </div>
          ) : (
            <div className={styles.heroTextText}>
              Experience the epic duel between batter and pitcher <br />
              in this fully on-chain baseball strategy game.
            </div>
          )}
        </div>
        <Link href="/" passHref>
          <button className={styles.button}>Playtest now</button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
