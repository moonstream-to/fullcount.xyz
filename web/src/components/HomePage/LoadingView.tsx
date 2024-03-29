import styles from "./LoadingView.module.css";
import { Image } from "@chakra-ui/react";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import React from "react";

const LoadingView = () => {
  return (
    <div className={styles.container}>
      <Image
        alt={""}
        minW={"552px"}
        h={"123px"}
        position={"absolute"}
        src={`${FULLCOUNT_ASSETS_PATH}/stadium.png`}
        right={"50%"}
        bottom={"75%"}
        transform={"translateX(50%) translateY(50%)"}
        filter={"blur(0px)"}
      />
      <Image
        src={`${FULLCOUNT_ASSETS_PATH}/logo-4-no-stroke.png`}
        position={"absolute"}
        top={"10%"}
        right={"50%"}
        w={"158px"}
        transform={"translateX(50%) translateY(-40px)"}
        alt={""}
        h={"84px"}
        zIndex={"0"}
      />
      <Image
        src={`${FULLCOUNT_ASSETS_PATH}/batter.png`}
        position={"absolute"}
        bottom={"0"}
        right={"50%"}
        minW={"165px"}
        transform={"translateX(0) translateY(-40px)"}
        alt={""}
        h={"395px"}
        zIndex={"0"}
      />
      <Image
        src={`${FULLCOUNT_ASSETS_PATH}/pitcher.png`}
        position={"absolute"}
        bottom={"65%"}
        right={"50%"}
        transform={"translateX(50%) translateY(100%)"}
        alt={""}
        w={"60px"}
        h={"80px"}
        zIndex={"0"}
      />
    </div>
  );
};

export default LoadingView;
