import styles from "./UpcomingEvents.module.css";
import { Flex, Image } from "@chakra-ui/react";
import CalendarIcon from "../icons/CalendarIcon";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
const assets = FULLCOUNT_ASSETS_PATH;

const UpcomingEvents = () => {
  return (
    <div className={styles.container}>
      <Flex alignItems={"center"} gap={"10px"}>
        <CalendarIcon />
        <div className={styles.title}>Upcoming events</div>
      </Flex>
      <div className={styles.eventsContainer}>
        <Flex
          alignItems={"center"}
          gap={"10px"}
          w={{ base: "auto", md: "351px" }}
          justifyContent={"end"}
        >
          <Image
            src={`${assets}/landing/arbitrum-nova-logo.svg`}
            w={{ base: "32px", md: "40px" }}
            h={{ base: "32px", md: "40px" }}
            alt="arbitrum-nova"
          />
          <div className={styles.event}>
            <div className={styles.date}>March 15</div>
            <div className={styles.label}>Nova League launch on Arbitrum Nova</div>
          </div>
        </Flex>
        <div className={styles.divider} />
        <Flex alignItems={"center"} gap={"10px"} w={{ base: "auto", md: "351px" }}>
          <Image
            src={`${assets}/landing/base-logo.svg`}
            w={{ base: "32px", md: "40px" }}
            h={{ base: "32px", md: "40px" }}
            alt="base"
          />
          <div className={styles.label}>Base League launch on Base</div>
        </Flex>
      </div>
    </div>
  );
};

export default UpcomingEvents;
