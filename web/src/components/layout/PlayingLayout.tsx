import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import { Flex } from "@chakra-ui/react";

const sounds = {
  whoosh: "sounds/whoosh.wav",
  heartbeat: "sounds/heartbeat.wav",
  swoosh: "sounds/windy-swoosh.wav",
  swing: "sounds/fast-swoosh.wav",
  clapping: "sounds/clapping-male-crowd.wav",
  hit: "sounds/hard-hit.wav",
  catch: "sounds/ball-hit.wav",
};

const PlayingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex
      direction="column"
      minH={"100vh"}
      gap={"40px"}
      p={"0 7% 60px 7%"}
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
