import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./AtBatView.module.css";
import { useQuery, UseQueryResult } from "react-query";
import { getAtBat } from "../../services/fullcounts";
import { useGameContext } from "../../contexts/GameContext";
import Score from "./Score";
import AtBatFooter from "./AtBatFooter";
import { AtBatStatus, Token } from "../../types";
import { getContracts } from "../../utils/getWeb3Contracts";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { Image, useMediaQuery } from "@chakra-ui/react";
import { outcomeDelay } from "./OutcomeForReplay";
import ExitIcon from "../icons/ExitIcon";
import TokenCard from "./TokenCard";
import ScoreForDesktop from "./ScoreForDesktop";
import { useSound } from "../../hooks/useSound";
import { InfoIcon } from "@chakra-ui/icons";
import { emptyPitch } from "./OnboardingAPI";
import OutcomeForReplay from "./OutcomeForReplay";
import ReplayIcon from "../icons/ReplayIcon";

export const outcomes = [
  "In Progress",
  "Strikeout",
  "Walk",
  "Single",
  "Double",
  "Triple",
  "Home Run",
  "In Play Out",
];

export const sessionOutcomes = [
  "Strike",
  "Ball",
  "Foul",
  "Single",
  "Double",
  "Triple",
  "Home Run",
  "In Play Out",
];

export const outcomeType = (
  tokens: Token[],
  atBat: AtBatStatus,
): "positive" | "negative" | undefined => {
  const { pitcher, batter } = atBat;
  if (tokens.some((t) => t.address === pitcher?.address && t.id === pitcher.id)) {
    return atBat.outcome === 1 || atBat.outcome === 7 ? "positive" : "negative";
  }
  if (tokens.some((t) => t.address === batter?.address && t.id === batter.id)) {
    return atBat.outcome === 1 || atBat.outcome === 7 ? "negative" : "positive";
  }
};

const stateAfterPitch = (atBat: AtBatStatus, pitchIdx: number, log = false) => {
  if (log) {
    console.log(pitchIdx);
  }
  if (!atBat) {
    return atBat;
  }
  if (pitchIdx + 1 >= atBat.pitches.length) {
    return atBat;
  }
  const pitches = atBat.pitches.slice(0, pitchIdx + 1);
  pitches.push({ ...emptyPitch, didPitcherCommit: false });
  const balls = pitches.filter((p) => p.outcome === 1).length;
  let strikes = 0;
  pitches.forEach((p) => {
    if ((p.outcome === 0 && p.progress === 5) || (p.outcome === 2 && strikes < 2)) {
      strikes += 1;
    }
  });

  return { ...atBat, outcome: 0, numberOfSessions: pitches.length, pitches, balls, strikes };
};

const AtBatReplay: React.FC = () => {
  const router = useRouter();
  const { tokensCache } = useGameContext();
  const [atBatId, setAtBatId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPitchOutcome, setShowPitchOutcome] = useState(false);
  const [currentSessionIdx, setCurrentSessionIdx] = useState(0);
  const [isBigView] = useMediaQuery("(min-width: 1024px)");
  const playSound = useSound();
  const [isPitchOutcomeVisible, setIsPitchOutcomeVisible] = useState(false);
  const [isReplayOver, setIsReplayOver] = useState(false);
  const [isOutcomePitchVisible, setIsOutcomePitchVisible] = useState(false);
  const [intervalId, setIntervalId] = useState<any>(undefined);
  const [replaysCount, setReplaysCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [windowHeight, setWindowHeight] = useState<number | undefined>(undefined);

  const updateHeight = () => {
    setWindowHeight(window.innerHeight);
  };
  useEffect(() => {
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);
  useEffect(() => {
    if (router.query.id && typeof router.query.id === "string") {
      setAtBatId(router.query.id);
    }
    if (router.query.session_id && typeof router.query.session_id === "string") {
      setSessionId(router.query.session_id);
    }
  }, [router.query.id, router.query.session_id]);

  const atBatState: UseQueryResult<{ atBat: AtBatStatus; tokens: Token[] }> = useQuery(
    ["atBat", atBatId, sessionId],
    async () => {
      let id = atBatId;
      if (!atBatId && sessionId) {
        const { gameContract } = getContracts();
        id = await gameContract.methods.SessionAtBat(sessionId).call();
        if (id) {
          setAtBatId(id);
        }
      }
      if (!id) {
        return;
      }
      return await getAtBat({ tokensCache, id: Number(id) });
    },
    {
      onSuccess: (data) => {
        if (!data) {
          return;
        }
        setShowPitchOutcome(true);
      },
      refetchInterval: false,
    },
  );

  useEffect(() => {
    if (!atBatState.data?.atBat) {
      return;
    }
    setTimeout(() => setIsPitchOutcomeVisible(true), outcomeDelay * 4);
  }, [currentSessionIdx, atBatState.data, replaysCount]);

  useEffect(() => {
    if (currentSessionIdx === 0 && atBatState.data) {
      if (intervalId) {
        clearInterval(intervalId);
      }
      setIntervalId(
        setInterval(() => {
          setCurrentSessionIdx((prev) => {
            if (prev + 1 < atBatState.data.atBat.pitches.length) {
              setIsOutcomePitchVisible(false);
              setIsPitchOutcomeVisible(false);
            }
            return prev + (prev + 1 < atBatState.data.atBat.pitches.length ? 1 : 0);
          });
        }, 10000),
      );
    }
  }, [currentSessionIdx, atBatState.data, replaysCount]);

  useEffect(() => {
    if (atBatState.data && currentSessionIdx > atBatState.data.atBat.pitches.length && intervalId) {
      clearInterval(intervalId);
    }
  }, [currentSessionIdx]);

  useEffect(() => {
    if (atBatState.data && atBatState.data.atBat.numberOfSessions > currentSessionIdx) {
      setIsPitchOutcomeVisible(false);
      setIsOutcomePitchVisible(false);
    }
    if (atBatState.data && atBatState.data.atBat.numberOfSessions <= currentSessionIdx + 1) {
      setTimeout(() => setIsReplayOver(true), outcomeDelay * 4);
    }
  }, [currentSessionIdx, replaysCount]);

  const handleExitClick = () => {
    playSound("homeButton");
    router.push("/");
  };

  return (
    <div
      className={styles.container}
      style={{ maxHeight: windowHeight ? `${windowHeight}px` : "100vh" }}
    >
      <div className={styles.exitButton} onClick={handleExitClick}>
        <ExitIcon />
      </div>
      <div
        className={styles.exitButton}
        style={{ top: "90px" }}
        onClick={() => {
          setCurrentSessionIdx(0);
          setIsReplayOver(false);
          setReplaysCount((prev) => prev + 1);
        }}
      >
        <ReplayIcon />
      </div>
      <Image
        minW={"441px"}
        h={"calc(25vh - 27px)"}
        position={"absolute"}
        src={`${FULLCOUNT_ASSETS_PATH}/stadium.png`}
        right={"50%"}
        top={"35.5px"}
        transform={"translateX(50%)"}
      />
      {/*{atBatState.data?.atBat &&*/}
      {/*  showPitchOutcome &&*/}
      {/*  stateAfterPitch(atBatState.data.atBat, currentSessionIdx).outcome !== 0 &&*/}
      {/*  stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches.length > 0 && (*/}
      {/*    <div className={styles.homeButton} onClick={handleExitClick}>*/}
      {/*      Go to home page*/}
      {/*    </div>*/}
      {/*  )}*/}

      {atBatState.data && !isBigView && (
        <Score
          atBat={stateAfterPitch(
            atBatState.data.atBat,
            currentSessionIdx - (isReplayOver ? 0 : 1) + (isPitchOutcomeVisible ? 1 : 0),
          )}
          pitch={
            stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches[currentSessionIdx]
          }
        />
      )}
      {atBatState.data && isBigView && (
        <ScoreForDesktop
          openHistory={true}
          atBat={stateAfterPitch(
            atBatState.data.atBat,
            currentSessionIdx - (isReplayOver ? 0 : 1) + (isPitchOutcomeVisible ? 1 : 0),
          )}
          pitch={
            stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches[currentSessionIdx]
          }
        />
      )}
      {atBatState.data?.atBat &&
        isPitchOutcomeVisible &&
        isOutcomePitchVisible &&
        !isReplayOver &&
        stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches.length > 0 && (
          <div className={styles.positiveOutcome} style={{ top: "18%" }}>
            {atBatState.data.atBat.numberOfSessions > currentSessionIdx + 1
              ? sessionOutcomes[
                  stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches[
                    stateAfterPitch(atBatState.data.atBat, currentSessionIdx).numberOfSessions - 2
                  ].outcome
                ]
              : sessionOutcomes[
                  stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches[
                    stateAfterPitch(atBatState.data.atBat, currentSessionIdx).numberOfSessions - 1
                  ].outcome
                ]}
            !
          </div>
        )}
      {atBatState.data?.atBat &&
        stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches[
          stateAfterPitch(atBatState.data.atBat, currentSessionIdx).numberOfSessions - 1
        ].progress !== 2 &&
        stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches[currentSessionIdx]
          .progress !== 6 && (
          <div className={styles.playerView}>
            {isBigView && atBatState.data?.atBat.pitcher && (
              <TokenCard token={atBatState.data?.atBat.pitcher} isPitcher={true} />
            )}
            {atBatState.data?.atBat &&
              stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches.length > 0 && (
                <>
                  {atBatState.data?.atBat && (
                    <OutcomeForReplay
                      replaysCount={replaysCount}
                      isPitchVisible={isOutcomePitchVisible}
                      setIsPitchVisible={setIsOutcomePitchVisible}
                      currentSessionIdx={currentSessionIdx}
                      atBat={stateAfterPitch(atBatState.data?.atBat, currentSessionIdx)}
                      forToken={undefined}
                      sessionStatus={
                        stateAfterPitch(atBatState.data.atBat, currentSessionIdx).outcome === 0
                          ? stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches[
                              stateAfterPitch(atBatState.data.atBat, currentSessionIdx)
                                .numberOfSessions - 2
                            ]
                          : stateAfterPitch(atBatState.data.atBat, currentSessionIdx).pitches[
                              stateAfterPitch(atBatState.data.atBat, currentSessionIdx)
                                .numberOfSessions - 1
                            ]
                      }
                    />
                  )}
                </>
              )}
            {isBigView && atBatState.data?.atBat.batter && (
              <TokenCard token={atBatState.data?.atBat.batter} isPitcher={false} />
            )}
          </div>
        )}

      {atBatState.data && !showPitchOutcome && !isBigView && (
        <AtBatFooter atBat={stateAfterPitch(atBatState.data.atBat, currentSessionIdx)} />
      )}
    </div>
  );
};

export default AtBatReplay;
