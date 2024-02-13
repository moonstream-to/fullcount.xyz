import { getAtBatOutputs, outputs } from "../web3/abi/ABIITems";
import { AtBat, FullcountContractSession, Session, Token } from "../types";
import { getTokenMetadata } from "./decoders";
import {
  GAME_CONTRACT,
  MULTICALL2_CONTRACT_ADDRESSES,
  SESSIONS_OFFSET,
  TOKEN_CONTRACT,
  ZERO_ADDRESS,
} from "../constants";
import { AbiItem } from "web3-utils";
import FullcountABIImported from "../web3/abi/FullcountABI.json";
import TokenABIImported from "../web3/abi/BLBABI.json";
import MulticallABIImported from "../web3/abi/Multicall2.json";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];
const TokenABI = TokenABIImported as unknown as AbiItem[];
const MulticallABI = MulticallABIImported as unknown as AbiItem[];
import { FullcountABI as FullcountContract, Multicall2 } from "../../types/web3-v1-contracts";

export const getSessions = async ({
  web3ctx,
  tokensCache,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  tokensCache: Token[];
}) => {
  console.log("FETCHING SESSIONS");
  const { gameContract, tokenContract, multicallContract } = getContracts(web3ctx);

  const numSessions = Number(await gameContract.methods.NumSessions().call());
  const secondsPerPhase = Number(await gameContract.methods.SecondsPerPhase().call());
  const target = GAME_CONTRACT;
  const callData: string[] = [];
  const oldestSessionNumber = Math.max(numSessions - SESSIONS_OFFSET, 1);
  for (let i = oldestSessionNumber; i <= numSessions; i += 1) {
    callData.push(gameContract.methods.sessionProgress(i).encodeABI());
    callData.push(gameContract.methods.getSession(i).encodeABI());
    callData.push(gameContract.methods.SessionRequiresSignature(i).encodeABI());
    callData.push(gameContract.methods.SessionAtBat(i).encodeABI());
  }
  const callsPerSession = 4;
  const queries = callData.map((callData) => {
    return {
      target,
      callData,
    };
  });

  const multicallRes = await multicallContract.methods.tryAggregate(false, queries).call();
  const res: {
    progress: string;
    session: string;
    requiresSignature: boolean;
    atBatID: number;
  }[] = [];
  for (let i = 0; i < multicallRes.length; i += callsPerSession) {
    res.push({
      progress: multicallRes[i][1],
      session: multicallRes[i + 1][1],
      requiresSignature: !!Number(multicallRes[i + 2][1]),
      atBatID: Number(multicallRes[i + 3][1]),
    });
  }
  const uniqueAtBatIDs = Array.from(new Set(res.map((item) => item.atBatID)));
  const atBatQueries = uniqueAtBatIDs.map((id) => {
    return {
      target,
      callData: gameContract.methods.getAtBat(id).encodeABI(),
    };
  });
  const atBatsRes = await multicallContract.methods.tryAggregate(false, atBatQueries).call();
  const decodedAtBatsRes = atBatsRes.map(
    (atBat: [boolean, string]) =>
      web3ctx.web3.eth.abi.decodeParameters(getAtBatOutputs, atBat[1])[0],
  );
  const atBats = uniqueAtBatIDs.map((id, idx) => {
    return { id, ...decodedAtBatsRes[idx] };
  });
  const decodedRes = res.map((data) => {
    const sessionRaw = web3ctx.web3.eth.abi.decodeParameters(
      outputs,
      data.session,
    )[0] as FullcountContractSession;
    const session = {
      ...sessionRaw,
      pitcherAddress: sessionRaw.pitcherNFT.nftAddress,
      pitcherTokenID: sessionRaw.pitcherNFT.tokenID,
      batterAddress: sessionRaw.batterNFT.nftAddress,
      batterTokenID: sessionRaw.batterNFT.tokenID,
      requiresSignature: data.requiresSignature,
      atBatID: data.atBatID,
    };
    return {
      progress: Number(data.progress),
      session,
    };
  });
  const tokens: { address: string; id: string }[] = [];
  decodedRes.forEach((res) => {
    if (
      res.session.pitcherAddress !== ZERO_ADDRESS &&
      !tokens.some(
        (t) => t.address === res.session.pitcherAddress && t.id === res.session.pitcherTokenID,
      ) &&
      !tokensCache.some(
        (t) => t.address === res.session.pitcherAddress && t.id === res.session.pitcherTokenID,
      )
    ) {
      tokens.push({ address: res.session.pitcherAddress, id: res.session.pitcherTokenID });
    }
    if (
      res.session.batterAddress !== ZERO_ADDRESS &&
      !tokens.some(
        (t) => t.address === res.session.batterAddress && t.id === res.session.batterTokenID,
      ) &&
      !tokensCache.some(
        (t) => t.address === res.session.batterAddress && t.id === res.session.batterTokenID,
      )
    ) {
      tokens.push({ address: res.session.batterAddress, id: res.session.batterTokenID });
    }
  });

  const tokenQueries: { target: string; callData: string }[] = [];
  tokens.forEach((token) => {
    tokenContract.options.address = token.address;
    tokenQueries.push({
      target: token.address,
      callData: tokenContract.methods.tokenURI(token.id).encodeABI(),
    });
    tokenQueries.push({
      target: tokenContract.options.address,
      callData: tokenContract.methods.ownerOf(token.id).encodeABI(),
    });
  });

  const tokenRes = await multicallContract.methods.tryAggregate(false, tokenQueries).call();

  const tokensParsed: Token[] = await Promise.all(
    tokens.map(async (token, idx) => {
      const uri = web3ctx.web3.utils.hexToAscii(tokenRes[idx * 2][1]);
      const tokenMetadata = await getTokenMetadata(uri);

      const adr = "0x" + tokenRes[idx * 2 + 1][1].slice(-40);
      const staker = web3ctx.web3.utils.toChecksumAddress(adr);
      return {
        ...token,
        image: tokenMetadata.image,
        name: tokenMetadata.name.split(` - ${token.id}`)[0],
        staker,
      };
    }),
  );

  const tokensFromChainAndCache = tokensParsed.concat(tokensCache);

  const sessionsWithTokens = decodedRes.map((session, idx) => {
    const pair: { pitcher: Token | undefined; batter: Token | undefined } = {
      pitcher: tokensFromChainAndCache.find(
        (token) =>
          token.address === session.session.pitcherAddress &&
          token.id === session.session.pitcherTokenID,
      ),
      batter: tokensFromChainAndCache.find(
        (token) =>
          token.address === session.session.batterAddress &&
          token.id === session.session.batterTokenID,
      ),
    };

    return {
      pair,
      batterLeftSession: session.session.batterLeftSession,
      pitcherLeftSession: session.session.pitcherLeftSession,
      sessionID: oldestSessionNumber + idx,
      phaseStartTimestamp: Number(session.session.phaseStartTimestamp),
      secondsPerPhase,
      progress: session.progress,
      atBatID: session.session.atBatID,
      atBat: atBats.find((atBat: AtBat) => atBat.id === session.session.atBatID),
      didPitcherCommit: session.session.didPitcherCommit,
      didPitcherReveal: session.session.didPitcherReveal,
      didBatterCommit: session.session.didBatterCommit,
      didBatterReveal: session.session.didBatterReveal,
      outcome: Number(session.session.outcome),
      requiresSignature: session.session.requiresSignature,
    };
  });
  const filteredAndSortedSessions = getAtBatsFromSessions(sessionsWithTokens.reverse()).filter(
    (s) =>
      (s.progress !== 6 && s.progress !== 1) ||
      s.pair.batter?.staker === web3ctx.account ||
      s.pair.pitcher?.staker === web3ctx.account,
  );
  return { sessions: filteredAndSortedSessions, tokens: tokensFromChainAndCache };
};

const getContracts = (web3ctx: MoonstreamWeb3ProviderInterface) => {
  const { web3 } = web3ctx;
  const gameContract = new web3.eth.Contract(FullcountABI) as unknown as FullcountContract;
  gameContract.options.address = GAME_CONTRACT;
  const tokenContract = new web3.eth.Contract(TokenABI);
  tokenContract.options.address = TOKEN_CONTRACT;

  const MULTICALL2_CONTRACT_ADDRESS =
    MULTICALL2_CONTRACT_ADDRESSES[
      String(web3ctx.chainId) as keyof typeof MULTICALL2_CONTRACT_ADDRESSES
    ];
  const multicallContract = new web3ctx.web3.eth.Contract(
    MulticallABI,
    MULTICALL2_CONTRACT_ADDRESS,
  ) as unknown as Multicall2;
  return { gameContract, tokenContract, multicallContract };
};

const getAtBatsFromSessions = (sessions: Session[]) => {
  const uniqueAtBatIDArray = sessions.reduce((accumulator, current) => {
    if (!accumulator.has(current.atBatID)) {
      accumulator.set(current.atBatID, current);
    }
    return accumulator;
  }, new Map());
  return Array.from(uniqueAtBatIDArray.values());
};

export const getAtBats = async ({
  web3ctx,
  tokensCache,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  tokensCache: Token[];
}) => {
  console.log("FETCHING ATBATS");
  const { gameContract, tokenContract, multicallContract } = getContracts(web3ctx);
  const numAtBats = Number(await gameContract.methods.NumAtBats().call());
  const oldestAtBatNumber = Math.max(numAtBats - SESSIONS_OFFSET, 1);
  const callData = [];
  for (let i = oldestAtBatNumber; i <= numAtBats; i += 1) {
    callData.push(gameContract.methods.AtBatState(i).encodeABI());
    callData.push(gameContract.methods.getNumberOfSessionsInAtBat(i).encodeABI());
  }
  const queries = callData.map((callData) => {
    return {
      target: GAME_CONTRACT,
      callData,
    };
  });

  const atBatsRes = await multicallContract.methods.tryAggregate(false, queries).call();
  const [atBatStateRes, numSessions] = splitArray(atBatsRes, 2);
  console.log(atBatStateRes);
  const atBatsStates = atBatStateRes.map(
    (atBat: [boolean, string]) =>
      web3ctx.web3.eth.abi.decodeParameters(getAtBatOutputs, atBat[1])[0],
  );

  return atBatsStates;
};

function splitArray<T>(arr: T[][], n: number): T[][] {
  const result = Array.from({ length: n }, (): T[] => []);
  for (let i = 0; i < arr.length; i++) {
    result[i % n].push(arr[i][1]);
  }
  return result;
}
