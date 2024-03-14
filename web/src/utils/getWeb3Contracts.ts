import {
  CHAIN_ID,
  GAME_CONTRACT,
  MULTICALL2_CONTRACT_ADDRESSES,
  RPC,
  TOKEN_CONTRACT,
} from "../constants";

import { FullcountABI as FullcountContract, Multicall2 } from "../../types/web3-v1-contracts";
import { AbiItem } from "web3-utils";

import FullcountABIImported from "../web3/abi/FullcountABI.json";
import TokenABIImported from "../web3/abi/BLBABI.json";
import MulticallABIImported from "../web3/abi/Multicall2.json";
import Web3 from "web3";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];
const TokenABI = TokenABIImported as unknown as AbiItem[];
const MulticallABI = MulticallABIImported as unknown as AbiItem[];

export const getContracts = () => {
  const web3 = new Web3(RPC);
  const gameContract = new web3.eth.Contract(FullcountABI) as unknown as FullcountContract;
  gameContract.options.address = GAME_CONTRACT;
  const tokenContract = new web3.eth.Contract(TokenABI);
  tokenContract.options.address = TOKEN_CONTRACT;

  const MULTICALL2_CONTRACT_ADDRESS =
    MULTICALL2_CONTRACT_ADDRESSES[String(CHAIN_ID) as keyof typeof MULTICALL2_CONTRACT_ADDRESSES];
  const multicallContract = new web3.eth.Contract(
    MulticallABI,
    MULTICALL2_CONTRACT_ADDRESS,
  ) as unknown as Multicall2;
  return { gameContract, tokenContract, multicallContract };
};

export const getMulticallContract = () => {
  const web3 = new Web3(RPC);
  const MULTICALL2_CONTRACT_ADDRESS =
    MULTICALL2_CONTRACT_ADDRESSES[String(CHAIN_ID) as keyof typeof MULTICALL2_CONTRACT_ADDRESSES];
  return new web3.eth.Contract(MulticallABI, MULTICALL2_CONTRACT_ADDRESS) as unknown as Multicall2;
};
