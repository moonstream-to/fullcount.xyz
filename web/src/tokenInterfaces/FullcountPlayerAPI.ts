import { Token } from "../types";
import http from "../utils/httpFullcountPlayer";
import { FULLCOUNT_PLAYER_API, GAME_CONTRACT, TOKEN_CONTRACT } from "../constants";
import axios from "axios";
import { getTokensData } from "./BLBTokenAPI";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";

export async function fetchFullcountPlayerTokens({
  web3ctx,
}: {
  web3ctx: MoonstreamWeb3ProviderInterface;
}) {
  const ACCESS_TOKEN = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
  const res = await axios.get(`${FULLCOUNT_PLAYER_API}/nfts`, {
    params: {
      limit: 10,
      offset: 0,
    },
    headers: {
      Authorization: `bearer ${ACCESS_TOKEN}`,
    },
  });
  const tokens = res.data.nfts.map((nft: { erc721_address: string; token_id: string }) => ({
    id: nft.token_id,
    address: nft.erc721_address,
  }));

  return getTokensData({ web3ctx, tokens, tokensSource: "FullcountPlayerAPI" });
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
  const ACCESS_TOKEN = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
    role: roleNumber === 0 ? "pitcher" : "batter",
    require_signature: requireSignature,
  };
  const headers = {
    Authorization: `bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  const data = await axios
    .post(`${FULLCOUNT_PLAYER_API}/game/atbat`, postData, { headers })
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  return { sessionID: data.session_id, sign: data.signature };
}

export async function joinSessionFullcountPlayer({
  token,
  sessionID,
  inviteCode,
}: {
  token: Token;
  sessionID: number;
  inviteCode: string | undefined;
}): Promise<unknown> {
  const ACCESS_TOKEN = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
    session_id: String(sessionID),
    signature: inviteCode ?? "",
  };
  const headers = {
    Authorization: `bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  return axios
    .post(`${FULLCOUNT_PLAYER_API}/game/join`, postData, { headers })
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

export const unstakeFullcountPlayer = ({ token }: { token: Token }) => {
  const ACCESS_TOKEN = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
  };
  const headers = {
    Authorization: `bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  return axios
    .post(`${FULLCOUNT_PLAYER_API}/game/unstake`, postData, { headers })
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export const abortSessionFullcountPlayer = ({ token }: { token: Token }) => {
  const ACCESS_TOKEN = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
  };
  const headers = {
    Authorization: `bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  return axios
    .post(`${FULLCOUNT_PLAYER_API}/game/abort`, postData, { headers })
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export function commitSwingFullcountPlayer({
  sign,
  sessionID,
}: {
  sign: string;
  sessionID: number;
}) {
  return Promise.reject(new Error(`${commitSwingFullcountPlayer.name} is not implemented`));
}

export const revealSwingFullcountPlayer = ({
  nonce,
  sessionID,
  actionChoice,
  vertical,
  horizontal,
}: {
  nonce: string;
  actionChoice: number;
  vertical: number;
  horizontal: number;
  sessionID: number;
}) => {
  return Promise.reject(new Error(`${revealSwingFullcountPlayer.name} is not implemented`));
};

export const commitPitchFullcountPlayer = ({
  sign,
  sessionID,
}: {
  sign: string;
  sessionID: number;
}) => {
  return Promise.reject(new Error(`${commitPitchFullcountPlayer.name} is not implemented`));
};

export const revealPitchFullcountPlayer = ({
  nonce,
  sessionID,
  actionChoice,
  vertical,
  horizontal,
}: {
  nonce: string;
  actionChoice: number;
  vertical: number;
  horizontal: number;
  sessionID: number;
}) => {
  return Promise.reject(new Error(`${revealPitchFullcountPlayer.name} is not implemented`));
};
