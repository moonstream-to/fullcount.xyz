import { Flex } from "@chakra-ui/react";
import styles from "./Landing.module.css";
import Hero from "./Hero";
import UpcomingEvents from "./UpcomingEvents";
const Landing = () => {
  return (
    <Flex w={"100%"} direction={"column"}>
      <Hero />
      <UpcomingEvents />
    </Flex>
  );
};

export default Landing;
