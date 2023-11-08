import { Flex, Image } from "@chakra-ui/react";
import { AWS_STATIC_ASSETS_PATH } from "../../constants";

const assetsPath = `${AWS_STATIC_ASSETS_PATH}/moonbound`;

const TitleScreenLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      minH="100vh"
      flexDirection="column"
      justifyContent="center"
      alignItems={"center"}
      placeSelf="stretch"
      bg={"#1B1B1B"}
    >
      {children}
    </Flex>
  );
};

export default TitleScreenLayout;
