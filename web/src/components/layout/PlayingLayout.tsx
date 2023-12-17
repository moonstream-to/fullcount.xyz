import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import { Flex } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";

const sounds = {
  whoosh: `${FULLCOUNT_ASSETS_PATH}/sounds/whoosh.wav`,
  heartbeat: `${FULLCOUNT_ASSETS_PATH}/sounds/heartbeat.wav`,
  swoosh: `${FULLCOUNT_ASSETS_PATH}/sounds/windy-swoosh.wav`,
  swing: `${FULLCOUNT_ASSETS_PATH}/sounds/fast-swoosh.wav`,
  clapping: `${FULLCOUNT_ASSETS_PATH}/sounds/clapping-male-crowd.wav`,
  hit: `${FULLCOUNT_ASSETS_PATH}/sounds/hard-hit.wav`,
  catch: `${FULLCOUNT_ASSETS_PATH}/sounds/ball-hit.wav`,
};

const PlayingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      direction="column"
      minH={"100vh"}
      gap={"40px"}
      p={{ lg: "0 7% 60px 7%", base: "0 10px 80px 10px" }}
      maxW={"1440px"}
      placeSelf={"center"}
      w={"100%"}
      // bg={"#111133"}
    >
      <Navbar />
      <audio id="heartbeat" src={sounds.heartbeat} preload={"auto"} />
      <audio id="whoosh" src={sounds.whoosh} preload={"auto"} />
      <audio id="swoosh" src={sounds.swoosh} preload={"auto"} />
      <audio id="swing" src={sounds.swing} preload={"auto"} />
      <audio id="hit" src={sounds.hit} preload={"auto"} />
      <audio id="clapping" src={sounds.clapping} preload={"auto"} />
      <audio id="catch" src={sounds.catch} preload={"auto"} />

      {children}
    </Flex>
  );
};

export default PlayingLayout;
