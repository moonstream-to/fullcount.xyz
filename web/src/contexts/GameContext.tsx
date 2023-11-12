import React, { createContext, useContext, useState, ReactNode, FC } from "react";
import { Session, Token } from "../types";

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
  selectedToken: Token | undefined;
  selectedSession: Session | undefined;
  sessions: Session[] | undefined;
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
    progressFilter: [false, true, true, true, true, true, true],
    contractAddress:
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x1044C1Fc1dfFE0361e1f01450ce69595AE921A1a",
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 322),
    tokenAddress:
      process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "0xF674839663C9353379b48fEb2AFb019a07CA00F4",
    selectedToken: undefined,
    selectedSession: undefined,
    sessions: undefined,
  });

  const updateContext = (newState: Partial<GameContextProps>) => {
    setContextState((prevState) => ({ ...prevState, ...newState }));
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
