import styles from "./Footer.module.css";
import DiscordLogo from "../icons/DiscordLogo";
import TwitterLogo from "../icons/TwitterLogo";
import FullcountLogo from "../icons/FullcountLogo";

const Footer = () => {
  return (
    <div className={styles.container}>
      <FullcountLogo />
      <div className={styles.socialsContainer}>
        <div className={styles.socialsTitle}>Follow us</div>
        <div className={styles.iconsContainer}>
          <DiscordLogo />
          <TwitterLogo />
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
    </div>
  );
};

export default Footer;
