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
  invited: boolean;
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
    contractAddress:
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x83930B5AaB9Fd82022De284F016f5C53e4749C9F",
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 80001),
    tokenAddress:
      process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "0xe710FD102Ae9DEFC95137BCB5D227fe945bfc844",
    selectedToken: undefined,
    selectedSession: undefined,
    sessions: undefined,
    invited: false,
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
