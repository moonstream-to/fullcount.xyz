import React, { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";

import Navbar from "./Navbar";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";

const sounds = {
  whoosh: `${FULLCOUNT_ASSETS_PATH}/sounds/whoosh.wav`,
  heartbeat: `${FULLCOUNT_ASSETS_PATH}/sounds/heartbeat.wav`,
  swoosh: `${FULLCOUNT_ASSETS_PATH}/sounds/windy-swoosh.wav`,
  swing: `${FULLCOUNT_ASSETS_PATH}/sounds/fast-swoosh.wav`,
  clapping: `${FULLCOUNT_ASSETS_PATH}/sounds/clapping-male-crowd.wav`,
  hit: `${FULLCOUNT_ASSETS_PATH}/sounds/eelke-hit-01.wav`,
  catch: `${FULLCOUNT_ASSETS_PATH}/sounds/martinimeniscus-glove-catch-6-ff009.wav`,
  select: `${FULLCOUNT_ASSETS_PATH}/sounds/select.wav`,
};

const PlayingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      direction="column"
      minH={"100vh"}
      gap={"30px"}
      p={"20px"}
      placeSelf={"center"}
      w={"100%"}
      background={"#FCECD9"}
      maxW={"1240px"}
    >
      <Navbar />
      <audio id="heartbeat" src={sounds.heartbeat} preload={"auto"} />
      <audio id="whoosh" src={sounds.whoosh} preload={"auto"} />
      <audio id="swoosh" src={sounds.swoosh} preload={"auto"} />
      <audio id="swing" src={sounds.swing} preload={"auto"} />
      <audio id="hit" src={sounds.hit} preload={"auto"} />
      <audio id="clapping" src={sounds.clapping} preload={"auto"} />
      <audio id="catch" src={sounds.catch} preload={"auto"} />
      <audio id="selectSound" src={sounds.select} preload={"auto"}></audio>
      {children}
    </Flex>
  );
};

export default PlayingLayout;
