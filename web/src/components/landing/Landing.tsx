import { Flex } from "@chakra-ui/react";
import styles from "./Landing.module.css";
import Hero from "./Hero";
import UpcomingEvents from "./UpcomingEvents";
import ChooseChalenge from "./ChooseChalenge";
import LaunchCareer from "./LaunchCareer";
const Landing = () => {
  return (
    <Flex w={"100%"} direction={"column"}>
      <Hero />
      <UpcomingEvents />
      <ChooseChalenge />
      <LaunchCareer />
    </Flex>
  );
};

export default Landing;
