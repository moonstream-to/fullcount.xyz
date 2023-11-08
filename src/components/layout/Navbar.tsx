import { Flex, Image, useMediaQuery, Button, Text } from "@chakra-ui/react";
import { AWS_STATIC_ASSETS_PATH } from "../../constants";
import Web3Context from "../../contexts/Web3Context/context";
import { useContext } from "react";
const assetsPath = `${AWS_STATIC_ASSETS_PATH}/fullcount`;

const Navbar = () => {
  const [isSmallScreen, isMediumScreen] = useMediaQuery([
    "(max-width: 767px)",
    "(min-width: 1024px)",
  ]);
  const { account } = useContext(Web3Context);

  const address = !isMediumScreen ? `${account.slice(0, 6)}...${account.slice(-4)}` : account;
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      alignItems="center"
      justifyContent={"space-between"}
      pt={{ base: "15px", sm: "5px" }}
      gap={"15px"}
      fontSize={{ sm: "16px", base: "14px" }}
    >
      <Text>Fullcount</Text>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        w={{ base: "100%", sm: "fit-content" }}
        gap={{ base: "auto", sm: "30px" }}
      >
        <Flex gap={{ base: "15px", sm: "30px" }} alignItems={"center"}>
          <Button variant={"transparent"} p={"10px"} gap={"10px"}>
            <Image alt={"help"} src={`${assetsPath}/icons/help-circle.png`} h={"20px"} w={"20px"} />
            {!isSmallScreen && <Text>Help</Text>}
          </Button>
          <Button variant={"transparent"} p={"10px"} gap={"10px"}>
            <Image alt={"discord"} src={`${assetsPath}/icons/discord.png`} w={"20px"} h={"15px"} />
            {!isSmallScreen && <Text>Discuss</Text>}
          </Button>
        </Flex>

        <Text lineHeight={"100%"} letterSpacing={"0.7px"}>
          {address}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Navbar;
