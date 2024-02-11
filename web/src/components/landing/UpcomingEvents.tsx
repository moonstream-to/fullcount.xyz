import styles from "./UpcomingEvents.module.css";
import { Flex } from "@chakra-ui/react";
import CalendarIcon from "../icons/CalendarIcon";
import NovaLogo from "../icons/NovaLogo";
import BaseLogo from "../icons/BaseLogo";

const UpcomingEvents = () => {
  return (
    <div className={styles.container}>
      <Flex alignItems={"center"} gap={"10px"}>
        <CalendarIcon />
        <div className={styles.title}>Upcoming events</div>
      </Flex>
      <div className={styles.eventsContainer}>
        <Flex alignItems={"center"} gap={"10px"}>
          <div style={{ width: "40px", height: "40px" }}>
            <NovaLogo />
          </div>
          <div className={styles.event}>
            <div className={styles.date}>March, 15</div>
            <div className={styles.label}>Nova League launch on Arbitrum Nova</div>
          </div>
        </Flex>
        <div className={styles.divider} />
        <Flex alignItems={"center"} gap={"10px"}>
          <div style={{ width: "40px", height: "40px" }}>
            <BaseLogo />
          </div>
          <div className={styles.label}>Base League launch on Base</div>
        </Flex>
      </div>
    </div>
  );
};

export default UpcomingEvents;
