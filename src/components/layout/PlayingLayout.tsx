import { ReactNode } from "react";
import Navbar from "./Navbar";
import { Flex } from "@chakra-ui/react";

const PlayingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      direction="column"
      minH={"100vh"}
      gap={"40px"}
      p={"0 7% 60px 7%"}
      maxW={"1900px"}
      placeSelf={"center"}
      w={"100%"}
    >
      <Navbar />
      {children}
    </Flex>
  );
};

export default PlayingLayout;
