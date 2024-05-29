import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./AtBatView.module.css";
import { useQuery, useQueryClient, UseQueryResult } from "react-query";
import { getAtBat } from "../../services/fullcounts";
import { useGameContext } from "../../contexts/GameContext";
import Score from "./Score";
import AtBatFooter from "./AtBatFooter";
import PitcherViewMobile from "../playing/PitcherViewMobile";
import { AtBatStatus, OwnedToken, Token } from "../../types";
import BatterViewMobile from "../playing/BatterViewMobile";
import { getContracts } from "../../utils/getWeb3Contracts";
import { FULLCOUNT_ASSETS_PATH } from "../../constants";
import { Image, useDisclosure, useMediaQuery } from "@chakra-ui/react";
import Outcome2, { sessionOutcomeType } from "./Outcome2";
import ExitIcon from "../icons/ExitIcon";
import TokenCard from "./TokenCard";
import ScoreForDesktop from "./ScoreForDesktop";
import { sendReport } from "../../utils/humbug";
import ExitDialog from "./ExitDialog";
import useUser from "../../contexts/UserContext";
import { fetchFullcountPlayerTokens } from "../../tokenInterfaces/FullcountPlayerAPI";
import { useSound } from "../../hooks/useSound";
import InviteLinkView from "./InviteLinkView";
import RematchButton from "./RematchButton";
import { getAtBatTrustedExecutor } from "../../tokenInterfaces/TrustedExecutorAPI";

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

const AtBatView: React.FC = () => {
  const router = useRouter();
  const { tokensCache, updateContext, selectedToken, joinedNotification } = useGameContext();
  const [atBatId, setAtBatId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPitchOutcome, setShowPitchOutcome] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(0);
  const [currentSessionIdx, setCurrentSessionIdx] = useState(0);
  const [isBigView] = useMediaQuery("(min-width: 1024px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useUser();
  const playSound = useSound();

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
    if (router.query.session_id && typeof router.query.session_id === "string" && !sessionId) {
      setSessionId(router.query.session_id);
    }
  }, [router.query.id, router.query.session_id]);

  const queryClient = useQueryClient();
  const atBatState: UseQueryResult<{ atBat: AtBatStatus; tokens: Token[] }> = useQuery(
    ["atBat", atBatId, sessionId],
    async () => {
      const id = atBatId;
      console.log(id);
      if (!id) {
        return;
      }
      // const atBat = await getAtBat({ tokensCache, id: Number(id) });
      const atBatTE = await getAtBatTrustedExecutor(id, tokensCache);
      console.log(atBatTE);
      // if (
      //   atBatState.data &&
      //   atBatState.data.atBat.outcome === 0 &&
      //   atBat &&
      //   atBat.atBat.outcome !== 0 &&
      //   selectedToken
      // ) {
      //   sendReport("At-bat outcome", {}, [
      //     "type:outcome",
      //     `outcome:${outcomeType([selectedToken], atBat.atBat)}`,
      //   ]);
      // }
      return atBatTE;
    },
    {
      onSuccess: (data) => {
        if (!data) {
          return;
        }
        if (data && !selectedToken && ownedTokens.data) {
          const token = ownedTokens.data.find(
            (t) => isSameToken(t, data.atBat.batter) || isSameToken(t, data.atBat.pitcher),
          );
          if (token) {
            updateContext({ selectedToken: { ...token } });
          }
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
      refetchInterval: 10000,
    },
  );

  const currentSessionProgress = useQuery(
    ["currentSessionProgress", currentSessionId, joinedNotification],
    async () => {
      if (
        !currentSessionId ||
        !joinedNotification ||
        !atBatState.data ||
        atBatState.data?.atBat.pitches.length > 1
      ) {
        return;
      }
      const { gameContract } = getContracts();
      const progress = await gameContract.methods.sessionProgress(currentSessionId).call();
      if (Number(currentSessionProgress.data) === 2 && Number(progress) === 3) {
        playSound("stadium");
      }
      return progress;
    },
    {
      refetchIntervalInBackground: true,
      refetchInterval: 10000,
      enabled: !!currentSessionId && joinedNotification,
    },
  );

  const isSameToken = (a: Token | undefined, b: Token | undefined) => {
    if (!a || !b) return false;
    return a.id === b.id && a.address === b.address;
  };

  const handleExitClick = () => {
    playSound("homeButton");
    if (
      atBatState.data?.atBat.pitches.length === 1 &&
      atBatState.data.atBat.pitches[0].progress == 2
    ) {
      onOpen();
    } else {
      sendReport("PlayView exit", {}, ["type:click", "click:atBatExit"]);
      router.push("/");
    }
  };

  const ownedTokens = useQuery(
    ["ownedTokensAfterRefresh", user],
    async () => {
      return user ? await fetchFullcountPlayerTokens() : [];
    },
    {
      enabled: !selectedToken,
    },
  );

  const handleRematch = (sessionID: number) => {
    setAtBatId(null);
    setSessionId(String(sessionID)); //sorry
    setCurrentSessionIdx(0);
    setShowPitchOutcome(false);
    setCurrentSessionId(0);
    queryClient.removeQueries("atBat");
    router.push({
      pathname: router.pathname,
      query: { session_id: sessionID },
    });
  };

  return (
    <div
      className={styles.container}
      style={{ maxHeight: windowHeight ? `${windowHeight}px` : "100vh" }}
    >
      <div className={styles.exitButton} onClick={handleExitClick}>
        <ExitIcon />
        {isOpen && selectedToken && (
          <ExitDialog
            token={selectedToken}
            sessionId={currentSessionId}
            onClose={onClose}
            atBatID={atBatId}
          />
        )}
      </div>
      <Image
        alt={""}
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
        atBatState.data.atBat.pitches.length > 0 &&
        selectedToken && (
          <div className={styles.outcomeButtons}>
            <RematchButton
              atBat={atBatState.data.atBat}
              selectedToken={selectedToken}
              onSuccess={handleRematch}
            />
            <button className={styles.homeButton} onClick={handleExitClick}>
              Go to home page
            </button>
          </div>
        )}
      {atBatState.data?.atBat &&
        atBatState.data.atBat.pitches[currentSessionIdx].progress === 6 &&
        selectedToken && (
          <div className={styles.outcomeButtons}>
            <RematchButton
              atBat={atBatState.data.atBat}
              selectedToken={selectedToken}
              onSuccess={handleRematch}
            />
            <button className={styles.homeButton} onClick={handleExitClick}>
              Go to home page
            </button>
          </div>
        )}

      {atBatState.data && !isBigView && atBatState.data.atBat.pitches[0].progress !== 2 && (
        <Score
          atBat={atBatState.data.atBat}
          pitch={atBatState.data.atBat.pitches[currentSessionIdx]}
        />
      )}
      {atBatState.data &&
        isBigView &&
        atBatState.data?.atBat.outcome === 0 &&
        !showPitchOutcome &&
        atBatState.data.atBat.pitches[0].progress !== 2 && (
          <ScoreForDesktop
            atBat={atBatState.data.atBat}
            pitch={atBatState.data.atBat.pitches[currentSessionIdx]}
          />
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
      {atBatState.data && atBatState.data.atBat.pitches[0].progress === 2 && (
        <>
          <div className={styles.invitePrompt}>
            Waiting for Opponent.
            <br />
            Invite Friend?
          </div>
          <InviteLinkView atBat={atBatState.data.atBat} />
        </>
      )}
      {atBatState.data?.atBat.outcome === 0 &&
        !showPitchOutcome &&
        atBatState.data.atBat.pitches[atBatState.data.atBat.numberOfSessions - 1].progress !== 2 &&
        atBatState.data.atBat.pitches[currentSessionIdx].progress !== 6 && (
          <div className={styles.playerView}>
            {isBigView && atBatState.data?.atBat.pitcher && (
              <TokenCard token={atBatState.data?.atBat.pitcher} isPitcher={true} />
            )}
            {selectedToken &&
              isSameToken(selectedToken, atBatState.data?.atBat.pitcher) &&
              atBatState.data && (
                <PitcherViewMobile
                  atBatID={String(atBatState.data.atBat.id)}
                  index={atBatState.data.atBat.numberOfSessions}
                  sessionStatus={atBatState.data.atBat.pitches.slice(-1)[0]}
                  token={selectedToken as OwnedToken}
                />
              )}
            {selectedToken &&
              atBatId &&
              isSameToken(selectedToken, atBatState.data?.atBat.batter) &&
              atBatState.data && (
                <BatterViewMobile
                  atBatID={String(atBatState.data.atBat.id)}
                  index={atBatState.data.atBat.numberOfSessions}
                  sessionStatus={atBatState.data.atBat.pitches.slice(-1)[0]}
                  token={selectedToken as OwnedToken} //TODO something. selectedToken can be Token (when view), but for actions OwnedToken needed
                />
              )}
            {isBigView && atBatState.data?.atBat.batter && (
              <TokenCard token={atBatState.data?.atBat.batter} isPitcher={false} />
            )}
          </div>
        )}
      {atBatState.data?.atBat && showPitchOutcome && atBatState.data.atBat.pitches.length > 0 && (
        <>
          {atBatState.data?.atBat && (
            <Outcome2
              atBat={atBatState.data?.atBat}
              forToken={selectedToken}
              sessionStatus={
                atBatState.data.atBat.outcome === 0
                  ? atBatState.data.atBat.pitches[atBatState.data.atBat.numberOfSessions - 2]
                  : atBatState.data.atBat.pitches[atBatState.data.atBat.numberOfSessions - 1]
              }
            />
          )}
        </>
      )}
      {atBatState.data &&
        !showPitchOutcome &&
        !isBigView &&
        atBatState.data.atBat.pitches[0].progress !== 2 && (
          <AtBatFooter atBat={atBatState.data.atBat} />
        )}
    </div>
  );
};

export default AtBatView;
