import { useState } from "react";
import Image from "next/image";

import styles from "./TitleScreen.module.css";
import useUser from "../contexts/UserContext";
import PlayingLayout from "./layout/PlayingLayout";
import Playing from "./Playing";
import SignUpForm from "./account/SignUpForm";
import LoginForm from "./account/LoginForm";

import { FULLCOUNT_ASSETS_PATH } from "../constants";
const TitleScreen = () => {
  const { user } = useUser();
  const [isLogging, setIsLogging] = useState(true); // login or signUp
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <>
      {user ? (
        <PlayingLayout>
          <Playing />
        </PlayingLayout>
      ) : (
        <div className={styles.loginContainer}>
          <Image
            alt={""}
            className={styles.logo}
            height={"84"}
            width={"158"}
            priority
            src={`${FULLCOUNT_ASSETS_PATH}/logo-4-no-stroke.png`}
          />
          <div className={styles.content}>
            {!isLogging ? (
              <SignUpForm setIsSuccess={(value) => setIsSuccess(value)} />
            ) : (
              <LoginForm setIsSuccess={(value) => setIsSuccess(value)} />
            )}
            {!isSuccess && (
              <div className={styles.footer}>
                <div className={styles.footerText}>
                  {isLogging ? "New to Fullcount?" : "Already have an account?"}
                </div>
                <div className={styles.footerButton} onClick={() => setIsLogging((prev) => !prev)}>
                  {isLogging ? "Create an account" : "Log in"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TitleScreen;
