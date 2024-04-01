import { Flex, Image } from "@chakra-ui/react";
import styles from "./Landing.module.css";
import Hero from "./Hero";
import UpcomingEvents from "./UpcomingEvents";
import ChooseChallenge from "./ChooseChallenge";
import LaunchCareer from "./LaunchCareer";
import ConnectAndJoin from "./ConnectAndJoin";
import Footer from "./Footer";
import MadeBy from "./MadeBy";
import router from "next/router";
import { FULLCOUNT_ASSETS } from "../../constants";
import { sessionOutcomeType } from "../atbat/Outcome2";
import Outwit from "./Outwit";
import BatterUp from "./BatterUp";
import Achievements from "./Achievements";
import Strikeout from "./Strikeout";
import TryIt from "./TryIt";
const Landing = () => {
  return (
    <div className={styles.container}>
      <div className={styles.limitedContainer}>
        <BatterUp />
        <div className={styles.secondBlockContainer}>
          <div className={styles.secondBlockTextContainer}>
            <div className={styles.title}>Take on weird and wily foes</div>
            <div className={styles.text}>Baseball. Strategy. Sasquatch.</div>
            <Image
              className={styles.secondBlockImage}
              alt={""}
              src={`${FULLCOUNT_ASSETS}/landing/campaign.png`}
            />
          </div>
        </div>
        <Outwit />
        <Achievements />
        <Strikeout />
        <TryIt />
        {/*<Hero />*/}
        {/*<UpcomingEvents />*/}
        {/*<ChooseChallenge />*/}
        {/*<LaunchCareer />*/}
        {/*<ConnectAndJoin />*/}
      </div>
      <Footer />
      <MadeBy />
    </div>
  );
};

export default Landing;
