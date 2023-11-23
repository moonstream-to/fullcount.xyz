/* eslint-disable @typescript-eslint/ban-types */
import Web3 from "web3/types";
import { AbiItem } from "web3-utils";

export interface WalletStatesInterface {
  ONBOARD: string;
  CONNECT: string;
  CONNECTED: string;
  UNKNOWN_CHAIN: string;
}

export type supportedChains = "localhost" | "mumbai" | "polygon" | "ethereum";

export interface ChainInterface {
  chainId: number;
  name: supportedChains;
  rpcs: Array<string>;
  ABIScan?: string;
}

export declare function GetMethodsAbiType<T>(abi: AbiItem[], name: keyof T): AbiItem;

export interface TokenInterface {
  address: string;
  deadline: number;
  signed_message: string;
}

declare function ChangeChain(chainName: supportedChains): void;
export interface MoonstreamWeb3ProviderInterface {
  web3: Web3;
  polygonClient: Web3;
  wyrmClient: Web3;
  mumbaiClient: Web3;
  onConnectWalletClick: Function;
  buttonText: string;
  WALLET_STATES: WalletStatesInterface;
  account: string;
  chainId: number;
  defaultTxConfig: Object;
  signAccessToken: Function;
  getMethodsABI: typeof GetMethodsAbiType;
  changeChain: typeof ChangeChain;
  targetChain: ChainInterface | undefined;
}

interface TokenMetadata {
  name: string;
  image: string;
}

interface Token {
  address: string;
  id: string;
  name: string;
  image: string;
  staker: string;
}

interface OwnedToken extends Token {
  isStaked: boolean;
  stakedSessionID: number;
}

interface Pair {
  pitcher: Token | undefined;
  batter: Token | undefined;
}

interface Session {
  pair: Pair;
  sessionID: number;
  progress: number;
  secondsPerPhase: number;
  phaseStartTimestamp: number;
  batterLeftSession: boolean;
  pitcherLeftSession: boolean;
  didPitcherCommit: boolean;
  didPitcherReveal: boolean;
  didBatterCommit: boolean;
  didBatterReveal: boolean;
  outcome: number;
}

interface FullcountContractSession {
  phaseStartTimestamp: string;
  pitcherNFT: { nftAddress: string; tokenID: string };
  didPitcherCommit: boolean;
  didPitcherReveal: boolean;
  pitcherCommit: string;
  pitcherReveal: { nonce: string; speed: string; vertical: string; horizontal: string };
  batterNFT: { nftAddress: string; tokenID: string };
  didBatterCommit: boolean;
  didBatterReveal: boolean;
  batterCommit: string;
  batterReveal: { nonce: string; kind: string; vertical: string; horizontal: string };
  outcome: string;
  pitcherLeftSession: boolean;
  batterLeftSession: boolean;
}

interface SessionsQueryData {
  sessions: Session[];
}
