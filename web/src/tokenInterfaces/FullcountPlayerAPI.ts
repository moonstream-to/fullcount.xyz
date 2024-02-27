import { OwnedToken, Token } from "../types";
import { FULLCOUNT_PLAYER_API, GAME_CONTRACT } from "../constants";
import axios from "axios";
import { getTokensData } from "./BLBTokenAPI";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";

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
    console.log("Error catching FullcountPlayer tokens\n", e);
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
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  return { sessionID: data.session_id, sign: "0x" + data.signature };
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
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
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
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
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
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
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
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
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
    .then((response) => {
      console.log("Success:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const getHeaders = () => {
  const ACCESS_TOKEN = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
  return {
    Authorization: `bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
};
