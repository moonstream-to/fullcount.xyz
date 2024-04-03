import styles from "./Footer.module.css";
import DiscordLogo from "../icons/DiscordLogo";
import FullcountLogo from "../icons/FullcountLogo";
import { Flex, useMediaQuery, Image } from "@chakra-ui/react";
import { DISCORD_LINK, FULLCOUNT_ASSETS } from "../../constants";

const Footer = () => {
  const [is768View, is1024View] = useMediaQuery(["(min-width: 768px)", "(min-width: 1024px)"]);
  return (
    <div className={styles.container}>
      {is768View ? (
        <>
          <Flex alignItems={"end"} justifyContent={"space-between"} w={"100%"}>
            <Flex direction={"column"} placeSelf={"stretch"} justifyContent={"space-between"}>
              <Image
                className={styles.image}
                alt={""}
                src={`${FULLCOUNT_ASSETS}/landing/logo-wordmark.svg`}
              />
              <div className={styles.legalHeaderContainer}>
                <a>
                  <div className={styles.legalText}>Privacy Policy</div>
                </a>
                <a>
                  <div className={styles.legalText}>Terms of Service</div>
                </a>
              </div>
            </Flex>
            {is1024View && (
              <div className={styles.legalText}>© 2024 Moonstream.to. All rights reserved</div>
            )}
            <div className={styles.socialsContainer}>
              <div className={styles.socialsTitle}>Follow us</div>
              <div className={styles.iconsContainer}>
                <DiscordLogo
                  cursor={"pointer"}
                  onClick={() => window.open(DISCORD_LINK, "_blank", "noopener,noreferrer")}
                />
              </div>
            </div>
          </Flex>
          {!is1024View && (
            <div className={styles.legalText}>© 2024 Moonstream.to. All rights reserved</div>
          )}
        </>
      ) : (
        <>
          <Image
            className={styles.image}
            alt={""}
            src={`${FULLCOUNT_ASSETS}/landing/logo-wordmark.svg`}
          />
          <div className={styles.socialsContainer}>
            <div className={styles.socialsTitle}>Follow us</div>
            <div className={styles.iconsContainer}>
              <DiscordLogo
                cursor={"pointer"}
                onClick={() => window.open(DISCORD_LINK, "_blank", "noopener,noreferrer")}
              />
            </div>
          </div>
          <div className={styles.legalContainer}>
            <div className={styles.legalHeaderContainer}>
              <a>
                <div className={styles.legalText}>Privacy Policy</div>
              </a>
              <a>
                <div className={styles.legalText}>Terms of Service</div>
              </a>
            </div>
            <div className={styles.legalText}>© 2024 Moonstream.to. All rights reserved</div>
          </div>
        </>
      )}
    </div>
  );
};

export default Footer;
