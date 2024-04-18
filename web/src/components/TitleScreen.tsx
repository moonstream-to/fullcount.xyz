import { useEffect, useState } from "react";
import Image from "next/image";

import styles from "./TitleScreen.module.css";
import useUser from "../contexts/UserContext";
import Playing from "./Playing";
import SignUpForm from "./account/SignUpForm";
import LoginForm from "./account/LoginForm";

import { FULLCOUNT_ASSETS, FULLCOUNT_ASSETS_PATH } from "../constants";
import LoadingView from "./HomePage/LoadingView";
import LaunchForm from "./LaunchForm";
import MoonstreamLogo2 from "./icons/MoonstreamLogo2";
import { useGameContext } from "../contexts/GameContext";
const TitleScreen = () => {
  const { user, isLoading } = useUser();
  const [isLogging, setIsLogging] = useState(false); // login or signUp
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFirstSeconds, setIsFirstSeconds] = useState(true);
  const { isLaunching, updateContext } = useGameContext();

  useEffect(() => {
    setTimeout(() => setIsFirstSeconds(false), 2000);
  }, []);

  return (
    <>
      {user ? (
        <Playing />
      ) : (
        <>
          {isFirstSeconds || isLoading ? (
            <LoadingView />
          ) : (
            <div className={styles.loginContainer}>
              <div className={styles.content} style={{ maxWidth: isLaunching ? "320px" : "400px" }}>
                <img
                  className={styles.banner}
                  src={`${FULLCOUNT_ASSETS}/landing/banner.png`}
                  alt={""}
                />
                {isLaunching ? (
                  <LaunchForm onClose={() => updateContext({ isLaunching: false })} />
                ) : (
                  <>
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
                        <div
                          className={styles.footerButton}
                          onClick={() => setIsLogging((prev) => !prev)}
                        >
                          {isLogging ? "Create an account" : "Log in"}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div
                  className={styles.contentFooter}
                  style={{ marginTop: isLaunching ? "-20px" : "0" }}
                >
                  <div className={styles.builtBy}>
                    {"built by"}
                    <MoonstreamLogo2 />
                  </div>
                  <div className={styles.builtBy}>
                    {"powered by"}
                    <img alt={"nova"} src={`${FULLCOUNT_ASSETS}/icons/arbitrum-nova-logo.svg`} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default TitleScreen;
