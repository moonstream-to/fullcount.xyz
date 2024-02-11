import { Flex } from "@chakra-ui/react";
import styles from "./Landing.module.css";
import Hero from "./Hero";
import UpcomingEvents from "./UpcomingEvents";
import ChooseChallenge from "./ChooseChallenge";
import LaunchCareer from "./LaunchCareer";
import ConnectAndJoin from "./ConnectAndJoin";
import Footer from "./Footer";
import MadeBy from "./MadeBy";
const Landing = () => {
  return (
    <Flex w={"100%"} direction={"column"} bg={"#1B1B1B"}>
      <Hero />
      <UpcomingEvents />
      <ChooseChallenge />
      <LaunchCareer />
      <ConnectAndJoin />
      <Footer />
      <MadeBy />
    </Flex>
  );
};

export default Landing;
