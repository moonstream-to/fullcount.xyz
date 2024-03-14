import { Token, TokenId } from "../types";
import { getContracts } from "../utils/getWeb3Contracts";
import { GAME_CONTRACT, ZERO_ADDRESS } from "../constants";
import { AbiItem } from "web3-utils";
import FullcountABIImported from "../web3/abi/FullcountABI.json";
import { getMulticallResults } from "../utils/multicall";
import { getTokensData } from "../tokenInterfaces/BLBTokenAPI";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const AT_BATS_OFFSET = 50;

export const getAtBats = async ({ tokensCache }: { tokensCache: Token[] }) => {
  console.log("FETCHING ATBATS");
  const { gameContract } = getContracts();
  const numAtBats = Number(await gameContract.methods.NumAtBats().call());
  const oldestAtBatNumber = Math.max(numAtBats - AT_BATS_OFFSET, 1);
  const callData = [];
  for (let i = oldestAtBatNumber; i <= numAtBats; i += 1) {
    callData.push(gameContract.methods.AtBatState(i).encodeABI());
    callData.push(gameContract.methods.getNumberOfSessionsInAtBat(i).encodeABI());
  }
  const atBatsQueries = callData.map((callData) => {
    return {
      target: GAME_CONTRACT,
      callData,
    };
  });

  const [states, numbersOfSessions] = await getMulticallResults(
    FullcountABI,
    ["AtBatState", "getNumberOfSessionsInAtBat"],
    atBatsQueries,
  );

  const lastSessionsQueries = [];

  for (let i = oldestAtBatNumber; i <= numAtBats; i += 1) {
    lastSessionsQueries.push({
      target: GAME_CONTRACT,
      callData: gameContract.methods
        .AtBatSessions(i, numbersOfSessions[i - oldestAtBatNumber] - 1)
        .encodeABI(),
    });
  }
  const [lastSessions] = await getMulticallResults(
    FullcountABI,
    ["AtBatSessions"],
    lastSessionsQueries,
  );

  const progressQueries = [];

  for (let i = oldestAtBatNumber; i <= numAtBats; i += 1) {
    progressQueries.push({
      target: GAME_CONTRACT,
      callData: gameContract.methods
        .sessionProgress(lastSessions[i - oldestAtBatNumber])
        .encodeABI(),
    });
  }

  const [progresses] = await getMulticallResults(
    FullcountABI,
    ["sessionProgress"],
    progressQueries,
  );

  const newTokens: TokenId[] = [];
  states.forEach((s) => {
    if (
      !tokensCache.some(
        (t) => t.address === s.pitcherNFT.nftAddress && t.id === s.pitcherNFT.tokenID,
      ) &&
      s.pitcherNFT.nftAddress !== ZERO_ADDRESS &&
      !newTokens.some((t) => t.address === s.pitcherNFT.nftAddress && t.id === s.pitcherNFT.tokenID)
    ) {
      newTokens.push({ address: s.pitcherNFT.nftAddress, id: s.pitcherNFT.tokenID });
    }
    if (
      !tokensCache.some(
        (t) => t.address === s.batterNFT.nftAddress && t.id === s.batterNFT.tokenID,
      ) &&
      s.batterNFT.nftAddress !== ZERO_ADDRESS &&
      !newTokens.some((t) => t.address === s.batterNFT.nftAddress && t.id === s.batterNFT.tokenID)
    ) {
      console.log(s.batterNFT.nftAddress, ZERO_ADDRESS);

      newTokens.push({ address: s.batterNFT.nftAddress, id: s.batterNFT.tokenID });
    }
  });

  const newTokensData = await getTokensData({ tokens: newTokens, tokensSource: "BLBContract" });
  const tokens = [...tokensCache, ...newTokensData];

  return {
    atBats: states.map((s, idx) => ({
      ...s,
      balls: Number(s.balls),
      outcome: Number(s.outcome),
      strikes: Number(s.strikes),
      pitcher: tokens.find(
        (t) => t.address === s.pitcherNFT.nftAddress && t.id === s.pitcherNFT.tokenID,
      ),
      batter: tokens.find(
        (t) => t.address === s.batterNFT.nftAddress && t.id === s.batterNFT.tokenID,
      ),
      id: idx + oldestAtBatNumber,
      numberOfSessions: Number(numbersOfSessions[idx]),
      lastSessionId: Number(lastSessions[idx]),
      progress: Number(progresses[idx]),
    })),
    tokens,
  };
};
