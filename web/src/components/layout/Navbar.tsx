import { Flex, useMediaQuery, Text, Link, useDisclosure } from "@chakra-ui/react";
import Web3Context from "../../contexts/Web3Context/context";
import { useContext } from "react";
import styles from "../GlobalStyles.module.css";
import SoundFxSlider from "./SoundFxSlider";
import { FEEDBACK_FORM_URL } from "../../constants";
import About from "./About";

const Navbar = () => {
  const [isSmallScreen, isMediumScreen] = useMediaQuery([
    "(max-width: 767px)",
    "(min-width: 1024px)",
  ]);
  const { account } = useContext(Web3Context);

  const address = !isMediumScreen ? `${account.slice(0, 6)}...${account.slice(-4)}` : account;
  const { onOpen, isOpen, onClose } = useDisclosure();
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      alignItems="center"
      justifyContent={"space-between"}
      pt={{ base: "15px", sm: "5px" }}
      gap={"15px"}
      fontSize={{ sm: "16px", base: "14px" }}
    >
      <Flex gap={"20px"} alignItems={"center"}>
        <Text className={styles.gradientText} fontSize={"14px"}>
          Fullcount
        </Text>
        <Link isExternal href={FEEDBACK_FORM_URL} _hover={{ textDecoration: "none" }}>
          <Text className={styles.navbarButton}>Give feedback</Text>
        </Link>
        <Text className={styles.navbarButton} onClick={onOpen}>
          About
        </Text>
        <About isOpen={isOpen} onClose={onClose} />
      </Flex>
      <Flex gap={"10px"}>
        <SoundFxSlider />
        <Flex
          justifyContent="space-between"
          alignItems="center"
          w={{ base: "100%", sm: "fit-content" }}
          gap={{ base: "auto", sm: "30px" }}
          border={"1px solid #4D4D4D"}
          p={"10px"}
        >
          <Text lineHeight={"100%"} letterSpacing={"0.7px"}>
            {address}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Navbar;
