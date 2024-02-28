import Web3 from "web3/types";
import { AbiItem } from "web3-utils";

export interface WalletStatesInterface {
  ONBOARD: string;
  CONNECT: string;
  CONNECTED: string;
  UNKNOWN_CHAIN: string;
}

export type supportedChains =
  | "localhost"
  | "mumbai"
  | "polygon"
  | "ethereum"
  | "wyrm"
  | "gnosis"
  | "sepolia";

export interface ChainInterface {
  chainId: number;
  name: supportedChains;
  rpcs: Array<string>;
  ABIScan?: { name: string; url: string };
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
  onConnectWalletClick: () => void;
  buttonText: string;
  WALLET_STATES: WalletStatesInterface;
  account: string;
  chainId: number;
  defaultTxConfig: object;
  // eslint-disable-next-line @typescript-eslint/ban-types
  signAccessToken: Function;
  getMethodsABI: typeof GetMethodsAbiType;
  changeChain: typeof ChangeChain;
  targetChain: ChainInterface | undefined;
}
