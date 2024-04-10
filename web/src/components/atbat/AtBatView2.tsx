import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./AtBatView.module.css";
import Score from "./Score";
import AtBatFooter from "./AtBatFooter";
import PitcherViewMobile from "../playing/PitcherViewMobile";
import { AtBatStatus, BatterReveal, OwnedToken, Token } from "../../types";
import { blbImage, FULLCOUNT_ASSETS_PATH } from "../../constants";
import { Image, useMediaQuery } from "@chakra-ui/react";
import Outcome2, { sessionOutcomeType } from "./Outcome2";
import TokenCard from "./TokenCard";
import ScoreForDesktop from "./ScoreForDesktop";
import BatterViewMobile2 from "./BatterViewMobile2";
import { getAtBat, initialAtBatState, selectedToken } from "./OnboardingAPI";
import { outcomeType, sessionOutcomes } from "./AtBatView";
import OnboardingCharacter from "./OnboardingCharacter";

const AtBatView2: React.FC = () => {
  const router = useRouter();
  const [showPitchOutcome, setShowPitchOutcome] = useState(false);
  const [currentSessionIdx, setCurrentSessionIdx] = useState(0);
  const [isBigView] = useMediaQuery("(min-width: 1024px)");
  const [swings, setSwings] = useState<BatterReveal[]>([]);
  const [atBat, setAtBat] = useState<AtBatStatus>(initialAtBatState);
  const [isCharacterSelectOpen, setIsCharacterSelectOpen] = useState(true);
  const [name, setName] = useState("Guest_0420");
  const [image, setImage] = useState(blbImage(7));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [windowHeight, setWindowHeight] = useState<number | undefined>(undefined);

  const updateHeight = () => {
    setWindowHeight(window.innerHeight);
  };

  useEffect(() => {
    const newAtBat = initialAtBatState;
    setAtBat({
      ...newAtBat,
      batter: { ...selectedToken, name, image },
      pitches: [
        { ...newAtBat.pitches[0], phaseStartTimestamp: String(Math.floor(Date.now() / 1000)) },
      ],
    });
  }, [name, image, isCharacterSelectOpen]);

  useEffect(() => {
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const isSameToken = (a: Token | undefined, b: Token | undefined) => {
    if (!a || !b) return false;
    return a.id === b.id && a.address === b.address;
  };

  const handleSwing = (swing: BatterReveal) => {
    const newSwings = [...swings, swing];
    const newAtBat = getAtBat(newSwings, atBat);
    setTimeout(() => {
      if (newAtBat.numberOfSessions - 1 !== currentSessionIdx) {
        setCurrentSessionIdx(newAtBat.numberOfSessions - 1);
        setShowPitchOutcome(true);
        setTimeout(() => setShowPitchOutcome(false), 5000);
      }
      if (newAtBat.outcome !== 0) {
        setShowPitchOutcome(true);
      }
      setSwings(newSwings);
      setAtBat(newAtBat);
    }, 5000);
  };

  return (
    <div
      className={styles.container}
      style={{ maxHeight: windowHeight ? `${windowHeight}px` : "100vh" }}
    >
      {isCharacterSelectOpen && (
        <OnboardingCharacter
          onClose={() => setIsCharacterSelectOpen(false)}
          onChange={(name, image) => {
            setName(name);
            setImage(image);
          }}
        />
      )}
      <Image
        minW={"441px"}
        h={"calc(25vh - 27px)"}
        position={"absolute"}
        src={`${FULLCOUNT_ASSETS_PATH}/stadium.png`}
        right={"50%"}
        top={"35.5px"}
        transform={"translateX(50%)"}
        alt={""}
      />
      {atBat && showPitchOutcome && atBat.outcome !== 0 && atBat.pitches.length > 0 && (
        <div className={styles.homeButton} onClick={() => router.push("/")}>
          Go to home page
        </div>
      )}

      {!isBigView && <Score atBat={atBat} pitch={atBat.pitches[currentSessionIdx]} />}
      {isBigView && atBat.outcome === 0 && !showPitchOutcome && (
        <ScoreForDesktop atBat={atBat} pitch={atBat.pitches[currentSessionIdx]} openHistory />
      )}
      {atBat &&
        showPitchOutcome &&
        atBat.pitches.length > 0 &&
        selectedToken &&
        atBat.outcome === 0 && (
          <div
            className={
              !outcomeType([selectedToken], atBat)
                ? styles.othersOutcome
                : sessionOutcomeType(
                    [selectedToken],
                    atBat,
                    atBat.pitches[atBat.numberOfSessions - 2],
                  ) === "positive"
                ? styles.positiveOutcome
                : styles.negativeOutcome
            }
          >
            {sessionOutcomes[atBat.pitches[atBat.numberOfSessions - 2].outcome]}!
          </div>
        )}
      {atBat.outcome !== 0 && selectedToken && (
        <div
          className={
            !outcomeType([selectedToken], atBat)
              ? styles.othersOutcome
              : outcomeType([selectedToken], atBat) === "positive"
              ? styles.positiveOutcome2
              : styles.negativeOutcome2
          }
        >
          {outcomeType([selectedToken], atBat) === "positive" ? "you win!" : "you lose!"}
        </div>
      )}
      {atBat.outcome === 0 &&
        !showPitchOutcome &&
        atBat.pitches[atBat.numberOfSessions - 1].progress !== 2 &&
        atBat.pitches[currentSessionIdx].progress !== 6 && (
          <div className={styles.playerView}>
            {isBigView && atBat.pitcher && <TokenCard token={atBat.pitcher} isPitcher={true} />}
            {selectedToken && isSameToken(selectedToken, atBat.pitcher) && (
              <PitcherViewMobile
                sessionStatus={atBat.pitches.slice(-1)[0]}
                token={selectedToken as OwnedToken}
              />
            )}
            {selectedToken && isSameToken(selectedToken, atBat.batter) && (
              <BatterViewMobile2
                sessionStatus={atBat.pitches.slice(-1)[0]}
                addSwing={handleSwing}
                token={selectedToken as OwnedToken}
              />
            )}
            {isBigView && atBat.batter && <TokenCard token={atBat.batter} isPitcher={false} />}
          </div>
        )}
      {atBat && showPitchOutcome && atBat.pitches.length > 0 && (
        <>
          {atBat && (
            <Outcome2
              atBat={atBat}
              forToken={selectedToken}
              sessionStatus={
                atBat.outcome === 0
                  ? atBat.pitches[atBat.numberOfSessions - 2]
                  : atBat.pitches[atBat.numberOfSessions - 1]
              }
            />
          )}
        </>
      )}
      {!showPitchOutcome && !isBigView && <AtBatFooter atBat={atBat} />}
    </div>
  );
};

export default AtBatView2;
