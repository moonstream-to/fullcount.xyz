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

type TokenSource = "BLBContract" | "FullcountPlayerAPI";

interface TokenId {
  id: string;
  address: string;
}

interface Token {
  address: string;
  id: string;
  name: string;
  image: string;
  staker?: string;
  source?: TokenSource;
}

interface NFT {
  nftAddress: string;
  tokenID: string;
}

interface OwnedToken extends Token {
  isStaked: boolean;
  stakedSessionID: number;
  tokenProgress: number;
  activeSession?: { batterNFT: NFT; pitcherNFT: NFT };
}

interface Pair {
  pitcher: Token | undefined;
  batter: Token | undefined;
}

interface SessionState {
  didBatterCommit: boolean;
  didBatterReveal: boolean;
  didPitcherCommit: boolean;
  didPitcherReveal: boolean;
  phaseStartTimestamp: string;
}

interface PitcherReveal {
  nonce: string;
  speed: string;
  vertical: string;
  horizontal: string;
}

interface BatterReveal {
  nonce: string;
  kind: string;
  vertical: string;
  horizontal: string;
}

export interface SessionStatus {
  progress: number;
  outcome: number;
  sessionID: number;
  didPitcherCommit: boolean;
  didBatterCommit: boolean;
  didPitcherReveal: boolean;
  didBatterReveal: boolean;
  pitcherReveal: PitcherReveal;
  batterReveal: BatterReveal;
  phaseStartTimestamp: string;
}

interface AtBat {
  pitcher: Token | undefined;
  batter: Token | undefined;
  balls: number;
  strikes: number;
  outcome: number;
  lastSessionId?: number;
  id?: number;
  numberOfSessions?: number;
  lastSession?: SessionState;
  progress: number;
  requiresSignature: boolean;
}

interface AtBatStatus {
  pitcher: Token | undefined;
  batter: Token | undefined;
  balls: number;
  strikes: number;
  outcome: number;
  id: number | string;
  pitches: SessionStatus[];
  numberOfSessions: number;
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
  requiresSignature: boolean;
  atBat?: any;
  atBatID?: number;
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

interface PlayerStats {
  address: string;
  score: number;
  points_data: {
    batting_data: {
      strikeouts: number;
      walks: number;
      singles: number;
      doubles: number;
      triples: number;
      home_runs: number;
      in_play_outs: number;
      at_bats: number;
      hits: number;
      runs_batted_in: number;
      batting_average: number;
      on_base: number;
      slugging: number;
      ops: number;
    };
    pitching_data: {
      strikeouts: number;
      walks: number;
      singles: number;
      doubles: number;
      triples: number;
      home_runs: number;
      in_play_outs: number;
      innings: number;
      earned_runs: number;
      earned_run_average: number;
      whip: number;
      batting_average_against: number;
    };
  };
}

interface PitchLocation {
  pitch_vertical: number;
  pitch_horizontal: number;
  count: number;
}

interface SwingLocation {
  swing_vertical: number;
  swing_horizontal: number;
  count: number;
  swing_type: number;
}

interface EthereumError {
  code: number;
  message: string;
}

interface SessionStartedReturnValues {
  sessionID: string;
}

interface SessionStartedEvent {
  returnValues: SessionStartedReturnValues;
}

interface FullcountContractEvents {
  SessionStarted: SessionStartedEvent;
}

interface FullcountContractEventContainer {
  events: FullcountContractEvents;
}
