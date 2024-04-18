import React, { createContext, useContext, useState, ReactNode, FC, useEffect } from "react";
import { AtBat, OwnedToken, Session, Token } from "../types";
import { CHAIN_ID, GAME_CONTRACT, TOKEN_CONTRACT } from "../constants";

interface GameContextProps {
  nonce: number;
  speed: number;
  kind: number;
  vertical: number;
  horizontal: number;
  progressFilter: boolean[];
  contractAddress: string;
  tokenAddress: string;
  chainId: number;
  selectedToken: OwnedToken | undefined;
  selectedSession: Session | undefined;
  selectedAtBat: AtBat | undefined;
  sessions: Session[] | undefined;
  invitedBy: string;
  invitedTo: number | undefined;
  inviteCode: string;
  watchingToken: Token | undefined;
  isTokenSelected: boolean;
  tokensCache: Token[];
  sessionOffset: number;
  soundVolume: number;
  ownedTokens: OwnedToken[];
  secondsPerPhase: number | undefined;
  isCreateCharacter: boolean;
  atBatsForPractice: (AtBat | undefined)[] | undefined;
  selectedMode: number;
  selectedTokenIdx: number;
  joinedNotification: boolean;
  onboardingName: string;
  onboardingImageIdx: number;
  isLaunching: boolean;
}

interface GameContextType extends GameContextProps {
  updateContext: (newState: Partial<GameContextProps>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);
const SOUND_VOLUME_KEY = "soundVolume";

interface ProviderProps {
  children: ReactNode;
}

export const GameContextProvider: FC<ProviderProps> = ({ children }) => {
  const [contextState, setContextState] = useState<GameContextProps>({
    nonce: 0,
    speed: 0,
    kind: 0,
    vertical: 0,
    horizontal: 0,
    progressFilter: [true, true, true, true, true, true, true],
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? GAME_CONTRACT,
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? CHAIN_ID),
    tokenAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? TOKEN_CONTRACT,
    selectedToken: undefined,
    selectedSession: undefined,
    selectedAtBat: undefined,
    sessions: undefined,
    invitedBy: "",
    invitedTo: undefined,
    inviteCode: "",
    watchingToken: undefined,
    isTokenSelected: false,
    tokensCache: [],
    sessionOffset: 40,
    soundVolume: 20,
    ownedTokens: [],
    secondsPerPhase: undefined,
    isCreateCharacter: false,
    atBatsForPractice: undefined,
    selectedMode: 1,
    selectedTokenIdx: 0,
    joinedNotification: false,
    onboardingName: "",
    onboardingImageIdx: 0,
    isLaunching: true,
  });

  useEffect(() => {
    const storedVolume = localStorage.getItem(SOUND_VOLUME_KEY);
    if (storedVolume) {
      setContextState((prevState) => ({
        ...prevState,
        soundVolume: Number(storedVolume),
      }));
    }
  }, []);

  const updateContext = (newState: Partial<GameContextProps>) => {
    console.log("updating context: ", { newState });
    setContextState((prevState) => {
      const isTokenSelected =
        prevState.isTokenSelected || !!newState.selectedToken || !!prevState.selectedToken;
      if (newState.soundVolume !== undefined && newState.soundVolume !== prevState.soundVolume) {
        localStorage.setItem(SOUND_VOLUME_KEY, newState.soundVolume.toString());
      }
      return { ...prevState, ...newState, isTokenSelected };
    });
  };

  return (
    <GameContext.Provider value={{ ...contextState, updateContext }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
