import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "./AtBatView.module.css";
import { useQuery, useQueryClient, UseQueryResult } from "react-query";
import { getAtBat } from "../../services/fullcounts";
import { useGameContext } from "../../contexts/GameContext";
import Score from "./Score";
import AtBatFooter from "./AtBatFooter";
import PitcherViewMobile from "../playing/PitcherViewMobile";
import { AtBat, AtBatStatus, OwnedToken, Token } from "../../types";
import BatterViewMobile from "../playing/BatterViewMobile";
import { getContracts } from "../../utils/getWeb3Contracts";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { Image } from "@chakra-ui/react";
import Outcome2, { sessionOutcomeType } from "./Outcome2";
import ExitIcon from "../icons/ExitIcon";

const outcomes = [
  "In Progress",
  "Strikeout",
  "Walk",
  "Single",
  "Double",
  "Triple",
  "Home Run",
  "In Play Out",
];

const sessionOutcomes = [
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

const AtBatView: React.FC = () => {
  const router = useRouter();
  const [atBatId, setAtBatId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { tokensCache, updateContext, selectedToken } = useGameContext();
  const [showPitchOutcome, setShowPitchOutcome] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(0);
  const [currentSessionIdx, setCurrentSessionIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (router.query.id && typeof router.query.id === "string") {
      setAtBatId(router.query.id);
    }
    if (router.query.session_id && typeof router.query.session_id === "string") {
      setSessionId(router.query.session_id);
    }
  }, [router.query.id]);

  const queryClient = useQueryClient();
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
      return getAtBat({ tokensCache, id: Number(id) });
    },
    {
      onSuccess: (data) => {
        console.log(data);
        if (data && currentSessionId === 0) {
          setCurrentSessionId(data.atBat.pitches[data.atBat.numberOfSessions - 1].sessionID);
        }
        if (data && data.atBat.numberOfSessions - 1 !== currentSessionIdx) {
          setCurrentSessionIdx(data.atBat.numberOfSessions - 1);
          setShowPitchOutcome(true);
          setTimeout(() => setShowPitchOutcome(false), 5000);
        }
        if (data && data.atBat.outcome !== 0) {
          queryClient.refetchQueries("owned_tokens");
          setShowPitchOutcome(true);
        }
        if (tokensCache.length !== data?.tokens.length) {
          updateContext({ tokensCache: data?.tokens ?? tokensCache });
        }
      },
      // enabled: atBatId !== null,
      refetchInterval: 3000,
    },
  );

  useEffect(() => {
    console.log(selectedToken, atBatState.data?.atBat.batter);
  }, [atBatState.data?.atBat.batter, selectedToken]);

  const isSameToken = (a: Token | undefined, b: Token | undefined) => {
    if (!a || !b) return false;
    return a.id === b.id && a.address === b.address;
  };

  return (
    <div className={styles.container}>
      <div className={styles.exitButton} onClick={() => router.push("/")}>
        <ExitIcon onClick={() => router.push("/")} />
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
      {atBatState.data?.atBat &&
        showPitchOutcome &&
        atBatState.data.atBat.outcome !== 0 &&
        atBatState.data.atBat.pitches.length > 0 && (
          <div className={styles.homeButton} onClick={() => router.push("/")}>
            Go to home page
          </div>
        )}

      {atBatState.data && (
        <Score
          atBat={atBatState.data.atBat}
          pitch={atBatState.data.atBat.pitches[currentSessionIdx]}
        />
      )}
      {atBatState.data && atBatState.data.atBat.outcome !== 0 && selectedToken && (
        <div
          className={
            !outcomeType([selectedToken], atBatState.data.atBat)
              ? styles.othersOutcome
              : outcomeType([selectedToken], atBatState.data.atBat) === "positive"
              ? styles.positiveOutcome
              : styles.negativeOutcome
          }
        >
          {outcomes[atBatState.data.atBat.outcome]}!
        </div>
      )}
      {atBatState.data?.atBat &&
        showPitchOutcome &&
        atBatState.data.atBat.pitches.length > 0 &&
        selectedToken &&
        atBatState.data.atBat.outcome === 0 && (
          <div
            className={
              !outcomeType([selectedToken], atBatState.data.atBat)
                ? styles.othersOutcome
                : sessionOutcomeType(
                    [selectedToken],
                    atBatState.data.atBat,
                    atBatState.data.atBat.pitches[atBatState.data.atBat.numberOfSessions - 2],
                  ) === "positive"
                ? styles.positiveOutcome
                : styles.negativeOutcome
            }
          >
            {
              sessionOutcomes[
                atBatState.data.atBat.pitches[atBatState.data.atBat.numberOfSessions - 2].outcome
              ]
            }
            !
          </div>
        )}
      {atBatState.data && atBatState.data.atBat.outcome !== 0 && selectedToken && (
        <div
          className={
            !outcomeType([selectedToken], atBatState.data.atBat)
              ? styles.othersOutcome
              : outcomeType([selectedToken], atBatState.data.atBat) === "positive"
              ? styles.positiveOutcome2
              : styles.negativeOutcome2
          }
        >
          {outcomeType([selectedToken], atBatState.data.atBat) === "positive"
            ? "you win!"
            : "you lose!"}
        </div>
      )}
      {atBatState.data?.atBat.outcome === 0 &&
        !showPitchOutcome &&
        atBatState.data.atBat.pitches[atBatState.data.atBat.numberOfSessions - 1].progress !== 2 &&
        atBatState.data.atBat.pitches[currentSessionIdx].progress !== 6 && (
          <div
            id={"player_container"}
            style={{ display: "flex", flexGrow: "2", alignItems: "flex-end" }}
          >
            {selectedToken &&
              isSameToken(selectedToken, atBatState.data?.atBat.pitcher) &&
              atBatState.data && (
                <PitcherViewMobile
                  sessionStatus={atBatState.data.atBat.pitches.slice(-1)[0]}
                  token={selectedToken as OwnedToken}
                />
              )}
            {selectedToken &&
              isSameToken(selectedToken, atBatState.data?.atBat.batter) &&
              atBatState.data && (
                <BatterViewMobile
                  sessionStatus={atBatState.data.atBat.pitches.slice(-1)[0]}
                  token={selectedToken as OwnedToken} //TODO something. selectedToken can be Token (when view), but for actions OwnedToken needed
                />
              )}
          </div>
        )}
      {atBatState.data?.atBat && showPitchOutcome && atBatState.data.atBat.pitches.length > 0 && (
        <>
          {atBatState.data?.atBat && (
            <Outcome2
              atBat={atBatState.data?.atBat}
              sessionStatus={
                atBatState.data.atBat.outcome === 0
                  ? atBatState.data.atBat.pitches[atBatState.data.atBat.numberOfSessions - 2]
                  : atBatState.data.atBat.pitches[atBatState.data.atBat.numberOfSessions - 1]
              }
            />
          )}
        </>
      )}
      {atBatState.data && !showPitchOutcome && <AtBatFooter atBat={atBatState.data.atBat} />}
    </div>
  );
};

export default AtBatView;
