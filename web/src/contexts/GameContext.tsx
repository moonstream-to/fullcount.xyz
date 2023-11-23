import React, { createContext, useContext, useState, ReactNode, FC, useEffect } from "react";
import { OwnedToken, Session, Token } from "../types";
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
  sessions: Session[] | undefined;
  invitedBy: string;
  invitedTo: number | undefined;
  watchingToken: Token | undefined;
  isTokenSelected: boolean;
  tokensCache: Token[];
}

interface GameContextType extends GameContextProps {
  updateContext: (newState: Partial<GameContextProps>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

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
    sessions: undefined,
    invitedBy: "",
    invitedTo: undefined,
    watchingToken: undefined,
    isTokenSelected: false,
    tokensCache: [],
  });

  const updateContext = (newState: Partial<GameContextProps>) => {
    setContextState((prevState) => {
      const isTokenSelected =
        prevState.isTokenSelected || !!newState.selectedToken || !!prevState.selectedToken;
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
