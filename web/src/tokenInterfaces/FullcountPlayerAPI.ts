import { OwnedToken, Token } from "../types";
import { FULLCOUNT_PLAYER_API, GAME_CONTRACT, RPC } from "../constants";
import axios from "axios";
import { getTokensData } from "./BLBTokenAPI";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
import Web3 from "web3";

export async function fetchFullcountPlayerTokens({
  web3ctx,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
}) {
  try {
    const headers = getHeaders();
    const res = await axios.get(`${FULLCOUNT_PLAYER_API}/nfts`, {
      params: {
        limit: 10,
        offset: 0,
      }, //TODO context vars
      headers,
    });
    const tokens = res.data.nfts.map((nft: { erc721_address: string; token_id: string }) => ({
      id: nft.token_id,
      address: nft.erc721_address,
    }));

    return await getTokensData({
      web3ctx,
      tokens,
      tokensSource: "FullcountPlayerAPI",
    });
  } catch (e) {
    console.log("Error fetching FullcountPlayer tokens\n", e);
    return [];
  }
}

export async function startSessionFullcountPlayer({
  token,
  roleNumber,
  requireSignature,
}: {
  token: Token;
  roleNumber: number;
  requireSignature: boolean;
}): Promise<{ sessionID: string; sign: string | undefined }> {
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
    role: roleNumber === 0 ? "pitcher" : "batter",
    require_signature: requireSignature,
  };
  const headers = getHeaders();

  const data = await axios
    .post(`${FULLCOUNT_PLAYER_API}/game/atbat`, postData, { headers })
    .then(async (response) => {
      const isTransactionMinted = await checkTransaction(response.data.transaction_hash);
      if (!isTransactionMinted) {
        throw new Error("Transaction failed. Try again, please");
      }
      console.log("Success:", response.data);
      return response.data;
    });
  return { sessionID: data.session_id, sign: "0x" + data.signature };
}

const delay = (delayInms: number) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

const getTransaction = async (transactionHash: string) => {
  for (let attempt = 1; attempt <= 10; attempt++) {
    const web3 = new Web3(RPC);
    const transaction = await web3.eth.getTransaction(transactionHash);
    if (transaction) return transaction;
    await delay(2 * 1000);
  }
  throw new Error(`Failed to receive transaction from getTransaction("${transactionHash}")`);
};

export const checkTransaction = async (transactionHash: string) => {
  return await getTransaction(transactionHash);
};

export function joinSessionFullcountPlayer({
  token,
  sessionID,
  inviteCode,
}: {
  token: Token;
  sessionID: number;
  inviteCode: string | undefined;
}): Promise<unknown> {
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
    session_id: String(sessionID),
    signature: inviteCode ?? "",
  };
  const headers = getHeaders();

  return axios
    .post(`${FULLCOUNT_PLAYER_API}/game/join`, postData, { headers })
    .then(async (response) => {
      const isTransactionMinted = await checkTransaction(response.data.transaction_hash);
      if (!isTransactionMinted) {
        throw new Error("Transaction failed. Try again, please");
      }
      console.log("Success:", response.data);
      return response.data;
    });
}

export const unstakeFullcountPlayer = ({ token }: { token: OwnedToken }) => {
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
  };
  const headers = getHeaders();

  return axios
    .post(
      `${FULLCOUNT_PLAYER_API}/game/${token.tokenProgress === 2 ? "abort" : "unstake"}`,
      postData,
      { headers },
    )
    .then(async (response) => {
      const isTransactionMinted = await checkTransaction(response.data.transaction_hash);
      if (!isTransactionMinted) {
        throw new Error("Transaction failed. Try again, please");
      }
      console.log("Success:", response.data);
      return response.data;
    });
};

function hexToDecimalString(hexValue: string): string {
  return BigInt(hexValue).toString();
}

export const commitOrRevealPitchFullcountPlayer = ({
  token,
  commit,
  isCommit,
}: {
  commit: { nonce: string; vertical: number; horizontal: number; actionChoice: number };
  token: OwnedToken;
  isCommit: boolean;
}) => {
  const { nonce, vertical, horizontal, actionChoice: speed } = commit;
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
    nonce,
    vertical,
    horizontal,
    speed,
  };
  const headers = getHeaders();

  return axios
    .post(`${FULLCOUNT_PLAYER_API}/game/pitch/${isCommit ? "commit" : "reveal"}`, postData, {
      headers,
    })
    .then(async (response) => {
      const isTransactionMinted = await checkTransaction(response.data.transaction_hash);
      if (!isTransactionMinted) {
        throw new Error("Transaction failed. Try again, please");
      }
      console.log("Success:", response.data);
      return response.data;
    });
};

export const commitOrRevealSwingFullcountPlayer = ({
  token,
  commit,
  isCommit,
}: {
  commit: { nonce: string; vertical: number; horizontal: number; actionChoice: number };
  token: OwnedToken;
  isCommit: boolean;
}) => {
  const { nonce, vertical, horizontal, actionChoice: kind } = commit;
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
    nonce: hexToDecimalString(nonce),
    vertical,
    horizontal,
    kind,
  };
  const headers = getHeaders();

  return axios
    .post(`${FULLCOUNT_PLAYER_API}/game/swing/${isCommit ? "commit" : "reveal"}`, postData, {
      headers,
    })
    .then(async (response) => {
      const isTransactionMinted = await checkTransaction(response.data.transaction_hash);
      if (!isTransactionMinted) {
        throw new Error("Transaction failed. Try again, please");
      }
      console.log("Success:", response.data);
      return response.data;
    });
};

export const mintFullcountPlayerToken = ({
  name,
  imageIndex,
}: {
  name: string;
  imageIndex: number;
}) => {
  const postData = {
    character_name: name,
    character_portrait: imageIndex,
  };
  const headers = getHeaders();
  return axios
    .post(`${FULLCOUNT_PLAYER_API}/mintblb`, postData, {
      headers,
    })
    .then(async (response) => {
      const isTransactionMinted = await checkTransaction(response.data.transaction_hash);
      if (!isTransactionMinted) {
        throw new Error("Transaction failed. Try again, please");
      }
      console.log("Success:", response.data);
      return response.data;
    });
};

const getHeaders = () => {
  const ACCESS_TOKEN = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
  return {
    Authorization: `bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
};
