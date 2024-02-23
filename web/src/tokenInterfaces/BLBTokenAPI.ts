import { FullcountContractEventContainer, OwnedToken, Token, TokenId, TokenSource } from "../types";
import { getTokenMetadata } from "../utils/decoders";
import { AbiItem } from "web3-utils";
import FullcountABIImported from "../web3/abi/FullcountABI.json";
import TokenABIImported from "../web3/abi/BLBABI.json";
import MulticallABIImported from "../web3/abi/Multicall2.json";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
import { FullcountABI as FullcountContract, Multicall2 } from "../../types/web3-v1-contracts";
import { GAME_CONTRACT, MULTICALL2_CONTRACT_ADDRESSES, TOKEN_CONTRACT } from "../constants";
import { sendTransactionWithEstimate } from "../utils/sendTransactions";
import { signSession } from "../utils/signSession";
import { getMulticallResults } from "../utils/multicall";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];
const TokenABI = TokenABIImported as unknown as AbiItem[];
const MulticallABI = MulticallABIImported as unknown as AbiItem[];

export const fetchOwnedBLBTokens = async ({
  web3ctx,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
}) => {
  const { tokenContract } = getContracts(web3ctx);
  const balanceOf = await tokenContract.methods.balanceOf(web3ctx.account).call();
  const tokensQueries = [];
  for (let i = 0; i < balanceOf; i += 1) {
    tokensQueries.push({
      target: TOKEN_CONTRACT,
      callData: tokenContract.methods.tokenOfOwnerByIndex(web3ctx.account, i).encodeABI(),
    });
  }

  const [tokens] = await getMulticallResults(
    web3ctx,
    TokenABI,
    ["tokenOfOwnerByIndex"],
    tokensQueries,
  );
  return await getTokensData({
    web3ctx,
    tokens: tokens.map((t) => ({ id: t, address: TOKEN_CONTRACT })),
    tokensSource: "BLBContract",
  });
};

export const getTokensData = async ({
  web3ctx,
  tokens,
  tokensSource,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  tokens: TokenId[];
  tokensSource: TokenSource;
}) => {
  const { tokenContract, gameContract } = getContracts(web3ctx);
  const stakedQueries = tokens.map((t) => ({
    target: gameContract.options.address,
    callData: gameContract.methods.StakedSession(t.address, t.id).encodeABI(),
  }));
  const [stakedSessions] = await getMulticallResults(
    web3ctx,
    FullcountABI,
    ["StakedSession"],
    stakedQueries,
  );

  const progressQueries = stakedSessions.map((s) => ({
    target: gameContract.options.address,
    callData: gameContract.methods.sessionProgress(s).encodeABI(),
  }));

  const [progresses] = await getMulticallResults(
    web3ctx,
    FullcountABI,
    ["sessionProgress"],
    progressQueries,
  );

  const uriQueries = tokens.map((t) => ({
    target: t.address,
    callData: tokenContract.methods.tokenURI(t.id).encodeABI(),
  }));

  const [uris] = await getMulticallResults(web3ctx, TokenABI, ["tokenURI"], uriQueries);

  const promises = uris.map(async (uri, idx) => {
    const { name, image } = await getTokenMetadata(uri);
    return {
      id: tokens[idx].id,
      name: name, //.split(` - ${tokens[idx].id}`)[0],
      image: image,
      address: tokenContract.options.address,
      staker: tokensSource === "BLBContract" ? web3ctx.account : "",
      isStaked: stakedSessions[idx] !== "0",
      stakedSessionID: Number(stakedSessions[idx]),
      tokenProgress: Number(progresses[idx]),
      source: tokensSource,
    };
  });

  return await Promise.all(promises);
};

export const startSessionBLB = ({
  web3ctx,
  token,
  role,
  requireSignature,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  token: Token;
  role: number;
  requireSignature: boolean;
}): Promise<{ sessionID: string; sign: string | undefined }> => {
  const { gameContract } = getContracts(web3ctx);

  return sendTransactionWithEstimate(
    web3ctx.account,
    gameContract.methods.startAtBat(token.address, token.id, role, requireSignature),
  )
    .then(
      (res: FullcountContractEventContainer) => res.events.SessionStarted.returnValues.sessionID,
    )
    .then(async (sessionID: string) => {
      const sign = requireSignature
        ? await signSession(web3ctx.account, window.ethereum, Number(sessionID))
        : undefined;
      return { sessionID, sign };
    });
};

export const joinSessionBLB = ({
  web3ctx,
  token,
  sessionID,
  inviteCode,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  token: Token;
  sessionID: number;
  inviteCode: string | undefined;
}) => {
  const { gameContract } = getContracts(web3ctx);
  return sendTransactionWithEstimate(
    web3ctx.account,
    gameContract.methods.joinSession(
      sessionID,
      token.address,
      token.id,
      inviteCode ? inviteCode : "0x",
    ),
  );
};
export const unstakeBLBToken = ({
  web3ctx,
  token,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  token: OwnedToken;
}) => {
  const { gameContract } = getContracts(web3ctx);

  if (token.tokenProgress === 2 && token.stakedSessionID) {
    return sendTransactionWithEstimate(
      web3ctx.account,
      gameContract.methods.abortSession(token.stakedSessionID),
    );
  }
  if (token.tokenProgress === 5 || token.tokenProgress === 6) {
    return sendTransactionWithEstimate(
      web3ctx.account,
      gameContract.methods.unstakeNFT(token.address, token.id),
    );
  }
};

export const commitSwingBLBToken = ({
  web3ctx,
  sign,
  sessionID,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  sign: string;
  sessionID: number;
}) => {
  const { gameContract } = getContracts(web3ctx);

  return sendTransactionWithEstimate(
    web3ctx.account,
    gameContract.methods.commitSwing(sessionID, sign),
  );
};

export const revealSwingBLBToken = ({
  web3ctx,
  nonce,
  sessionID,
  actionChoice,
  vertical,
  horizontal,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  nonce: string;
  actionChoice: number;
  vertical: number;
  horizontal: number;
  sessionID: number;
}) => {
  const { gameContract } = getContracts(web3ctx);
  return sendTransactionWithEstimate(
    web3ctx.account,
    gameContract.methods.revealSwing(sessionID, nonce, actionChoice, vertical, horizontal),
  );
};

export const commitPitchBLBToken = ({
  web3ctx,
  sign,
  sessionID,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  sign: string;
  sessionID: number;
}) => {
  const { gameContract } = getContracts(web3ctx);

  return sendTransactionWithEstimate(
    web3ctx.account,
    gameContract.methods.commitPitch(sessionID, sign),
  );
};

export const revealPitchBLBToken = ({
  web3ctx,
  nonce,
  sessionID,
  actionChoice,
  vertical,
  horizontal,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  nonce: string;
  actionChoice: number;
  vertical: number;
  horizontal: number;
  sessionID: number;
}) => {
  const { gameContract } = getContracts(web3ctx);
  return sendTransactionWithEstimate(
    web3ctx.account,
    gameContract.methods.revealPitch(sessionID, nonce, actionChoice, vertical, horizontal),
  );
};

export const mintBLBToken = ({
  web3ctx,
  name,
  imageIndex,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
  name: string;
  imageIndex: number;
}) => {
  const { tokenContract } = getContracts(web3ctx);
  return sendTransactionWithEstimate(web3ctx.account, tokenContract.methods.mint(name, imageIndex));
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
