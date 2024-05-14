import { useEffect, useState } from "react";
import Image from "next/image";

import styles from "./TitleScreen.module.css";
import useUser from "../contexts/UserContext";
import Playing from "./Playing";
import SignUpForm from "./account/SignUpForm";
import LoginForm from "./account/LoginForm";

import { FULLCOUNT_ASSETS } from "../constants";
import LoadingView from "./HomePage/LoadingView";
import LaunchForm from "./LaunchForm";
import MoonstreamLogo2 from "./icons/MoonstreamLogo2";
import { useGameContext } from "../contexts/GameContext";
import { useRouter } from "next/router";
import CloseIconBig from "./icons/CloseIconBig";

const TitleScreen = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false); // login or signUp
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFirstSeconds, setIsFirstSeconds] = useState(true);
  const { isLaunching, updateContext } = useGameContext();

  const [inviteFrom, setInviteFrom] = useState("");

  useEffect(() => {
    if (
      router.isReady &&
      router.query.invite_from &&
      typeof router.query.invite_from === "string"
    ) {
      setInviteFrom(router.query.invite_from);
      setIsLogging(true);
    }
  }, [router.isReady, router.query]);

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
                <div className={styles.banner}>
                  <img
                    className={styles.banner}
                    src={`${FULLCOUNT_ASSETS}/banners/Bl-banner-updated-logo.jpeg`}
                    alt={""}
                  />
                  {isLaunching ? (
                    <button
                      className={styles.loginButton}
                      onClick={() => {
                        setIsLogging(true);
                        updateContext({ isLaunching: false });
                      }}
                    >
                      Log in
                    </button>
                  ) : (
                    <button
                      className={styles.closeButton}
                      onClick={() => updateContext({ isLaunching: true })}
                    >
                      <CloseIconBig stroke={"white"} />
                    </button>
                  )}
                </div>

                {isLaunching && !inviteFrom ? (
                  <LaunchForm onClose={() => updateContext({ isLaunching: false })} />
                ) : (
                  <>
                    {!isLogging ? (
                      <SignUpForm
                        inviteFrom={inviteFrom}
                        setIsSuccess={(value) => setIsSuccess(value)}
                      />
                    ) : (
                      <LoginForm
                        inviteFrom={inviteFrom}
                        setIsSuccess={(value) => setIsSuccess(value)}
                      />
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
