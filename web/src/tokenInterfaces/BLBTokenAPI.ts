import { FullcountContractEventContainer, OwnedToken, Token, TokenId, TokenSource } from "../types";
import { getTokenMetadata } from "../utils/decoders";
import { AbiItem } from "web3-utils";
import FullcountABIImported from "../web3/abi/FullcountABI.json";
import TokenABIImported from "../web3/abi/BLBABI.json";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
import { TOKEN_CONTRACT } from "../constants";
import { sendTransactionWithEstimate } from "../utils/sendTransactions";
import { signSession } from "../utils/signSession";
import { getMulticallResults } from "../utils/multicall";
import { getContracts } from "../utils/getWeb3Contracts";

const FullcountABI = FullcountABIImported as unknown as AbiItem[];
const TokenABI = TokenABIImported as unknown as AbiItem[];

export const fetchOwnedBLBTokens = async ({
  web3ctx,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
}) => {
  if (!web3ctx.account) {
    return [];
  }
  try {
    const { tokenContract } = getContracts();
    const balanceOf = await tokenContract.methods.balanceOf(web3ctx.account).call();
    const tokensQueries = [];
    for (let i = 0; i < balanceOf; i += 1) {
      tokensQueries.push({
        target: TOKEN_CONTRACT,
        callData: tokenContract.methods.tokenOfOwnerByIndex(web3ctx.account, i).encodeABI(),
      });
    }

    const [tokens] = await getMulticallResults(TokenABI, ["tokenOfOwnerByIndex"], tokensQueries);
    return await getTokensData({
      tokens: tokens.map((t) => ({ id: t, address: TOKEN_CONTRACT })),
      tokensSource: "BLBContract",
    });
  } catch (e) {
    console.log("Error catching BLB tokens \n", e);
    return [];
  }
};

export const getTokensData = async ({
  tokens,
  tokensSource,
}: {
  tokens: TokenId[];
  tokensSource: TokenSource;
}) => {
  if (tokens.length < 1) {
    return [];
  }

  const { tokenContract, gameContract } = getContracts();
  const stakedQueries = tokens.map((t) => ({
    target: gameContract.options.address,
    callData: gameContract.methods.StakedSession(t.address, t.id).encodeABI(),
  }));
  const [stakedSessions] = await getMulticallResults(
    FullcountABI,
    ["StakedSession"],
    stakedQueries,
  );

  const progressQueries = stakedSessions.map((s) => ({
    target: gameContract.options.address,
    callData: gameContract.methods.sessionProgress(s).encodeABI(),
  }));

  const [progresses] = await getMulticallResults(
    FullcountABI,
    ["sessionProgress"],
    progressQueries,
  );

  const uriQueries = tokens.map((t) => ({
    target: t.address,
    callData: tokenContract.methods.tokenURI(t.id).encodeABI(),
  }));

  const [uris] = await getMulticallResults(TokenABI, ["tokenURI"], uriQueries);

  const promises = uris.map(async (uri, idx) => {
    const { name, image } = await getTokenMetadata(uri);
    return {
      id: tokens[idx].id,
      name: name.split(` - ${tokens[idx].id}`)[0],
      image: image,
      address: tokens[idx].address,
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
  const { gameContract } = getContracts();

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
  const { gameContract } = getContracts();
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
  const { gameContract } = getContracts();

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
  const { gameContract } = getContracts();

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
  const { gameContract } = getContracts();
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
  const { gameContract } = getContracts();

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
  const { gameContract } = getContracts();
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
  const { tokenContract } = getContracts();
  return sendTransactionWithEstimate(web3ctx.account, tokenContract.methods.mint(name, imageIndex));
};
