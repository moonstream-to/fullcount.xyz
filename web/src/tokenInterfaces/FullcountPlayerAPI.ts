import { OwnedToken, Token } from "../types";
import { FULLCOUNT_PLAYER_API, GAME_CONTRACT } from "../constants";
import axios from "axios";
import { getTokensData } from "./BLBTokenAPI";
import { getContracts } from "../utils/getWeb3Contracts";
import { getMulticallResults } from "../utils/multicall";
import { AbiItem } from "web3-utils";
import FullcountABIImported from "../web3/abi/FullcountABI.json";
import { sendReport } from "../utils/humbug";
import { CANT_ABORT_SESSION_MSG } from "../messages";
const FullcountABI = FullcountABIImported as unknown as AbiItem[];

const parseActiveSession = (s: any) => {
  return {
    ...s,
    batterNFT: { nftAddress: s.batterNFT[0], tokenID: s.batterNFT[1] },
    pitcherNFT: { nftAddress: s.pitcherNFT[0], tokenID: s.pitcherNFT[1] },
  };
};

export async function fetchFullcountPlayerTokens() {
  try {
    const headers = getHeaders();
    const res = await axios.get(`${FULLCOUNT_PLAYER_API}/nfts`, {
      params: {
        limit: 15,
        offset: 0,
      }, //TODO context vars
      headers,
    });
    const tokens = res.data.nfts.map((nft: { erc721_address: string; token_id: string }) => ({
      id: nft.token_id,
      address: nft.erc721_address,
    }));

    const tokensData = await getTokensData({
      tokens,
      tokensSource: "FullcountPlayerAPI",
    });
    const { gameContract } = getContracts();
    const activeSessionsIds = tokensData.filter((t) => t.isStaked).map((t) => t.stakedSessionID);
    const activeSessionsQueries = activeSessionsIds.map((id) => ({
      target: GAME_CONTRACT,
      callData: gameContract.methods.SessionState(id).encodeABI(),
    }));

    const [activeSessions] = await getMulticallResults(
      FullcountABI,
      ["SessionState"],
      activeSessionsQueries,
    );
    return tokensData.map((t) => {
      const sessionIdx = activeSessionsIds.indexOf(t.stakedSessionID);
      return sessionIdx === -1
        ? { ...t }
        : {
            ...t,
            activeSession: { ...activeSessions.map((s) => parseActiveSession(s))[sessionIdx] },
          };
    });
  } catch (e: any) {
    console.log("Error fetching FullcountPlayer tokens\n", e);
    sendReport("Error fetching FCPlayer tokens", { error: { message: e.message } }, [
      "type:error",
      "error_domain:fcplayer",
      `error:fcplayer-tokens`,
    ]);
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
  await unstakeFullcountPlayer({ token });

  const data = await axios
    .post(`${FULLCOUNT_PLAYER_API}/game/atbat`, postData, { headers })
    .then(async (response) => {
      const { gameContract } = getContracts();
      let isSuccess = false;
      for (let attempt = 1; attempt <= 30; attempt++) {
        console.log("checking sessionState after start, attempt: ", attempt);
        const sessionProgress = await gameContract.methods
          .sessionProgress(response.data.session_id)
          .call();
        if (Number(sessionProgress) === 2) {
          isSuccess = true;
          break;
        } else {
          console.log(sessionProgress, response.data);
        }
        await delay(3 * 1000);
      }
      if (!isSuccess) {
        throw new Error("Time out. Something with server. Sorry. ");
      }
      console.log("Success:", response.data);
      return response.data;
    });
  sendReport("Session started", {}, [
    "type:contract",
    "contract_method:start",
    `token_address:${token.address}`,
    `token_id:${token.id}`,
  ]);
  return { sessionID: data.session_id, sign: data.signature };
}

export const delay = (delayInms: number) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

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
  await unstakeFullcountPlayer({ token });

  const headers = getHeaders();

  return axios
    .post(`${FULLCOUNT_PLAYER_API}/game/join`, postData, { headers })
    .then(async (response) => {
      const { gameContract } = getContracts();
      let isSuccess = false;
      for (let attempt = 1; attempt <= 30; attempt++) {
        console.log("checking sessionState after join, attempt: ", attempt);
        const sessionProgress = await gameContract.methods.sessionProgress(sessionID).call();
        if (Number(sessionProgress) !== 2) {
          isSuccess = true;
          break;
        } else {
          console.log(sessionProgress, response.data);
        }
        await delay(3 * 1000);
      }
      if (!isSuccess) {
        throw new Error("Time out. Something with server. Sorry. ");
      }
      console.log("Success:", response.data);
      sendReport("Session joined", {}, [
        `type:contract', 'contract_method:join', token_address:${token.address}`,
        `token_id:${token.id}`,
      ]);
      return response.data;
    })
    .catch((e: any) => {
      sendReport("Joining failed", { error: { message: e.message } }, [
        "type:error",
        "error_domain:fcplayer",
        `error:fcplayer-joining`,
        `token_address:${token.address}`,
        `token_id:${token.id}`,
      ]);
      throw e;
    });
}

export const abortFullcountPlayerSession = async ({
  token,
  sessionId,
}: {
  token: Token;
  sessionId: number;
}) => {
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
  };
  const headers = getHeaders();
  const { gameContract } = getContracts();
  const progress = await gameContract.methods.sessionProgress(sessionId).call();
  if (Number(progress) !== 2) {
    throw new Error(CANT_ABORT_SESSION_MSG);
  }
  console.log("closing...", { sessionId, progress });
  return axios
    .post(`${FULLCOUNT_PLAYER_API}/game/abort`, postData, { headers })
    .then(async (response) => {
      const { gameContract } = getContracts();
      let isSuccess = false;
      for (let attempt = 1; attempt <= 30; attempt++) {
        console.log("checking token state after closing at-bat, attempt: ", attempt);
        const session = await gameContract.methods.StakedSession(token.address, token.id).call();
        if (Number(session) === 0) {
          isSuccess = true;
          break;
        } else {
          console.log(session, response.data);
        }
        await delay(3 * 1000);
      }
      if (!isSuccess) {
        throw new Error("Time out. Something with server. Sorry. ");
      }
      console.log("Success:", response.data);
      sendReport("Aborting session", {}, ["type:contract", "contract_method:abort"]);
      return response.data;
    })
    .catch((e: any) => {
      sendReport("Closing at-bat failed", { error: { message: e.message } }, [
        "type:error",
        "error_domain:fcplayer",
        `error:fcplayer-unstaking`,
        `token_address:${token.address}`,
        `token_id:${token.id}`,
      ]);
      throw e;
    });
};

export const unstakeFullcountPlayer = async ({ token }: { token: Token }) => {
  const postData = {
    fullcount_address: GAME_CONTRACT,
    erc721_address: token.address,
    token_id: token.id,
  };
  const headers = getHeaders();
  const { gameContract } = getContracts();
  const sessionId = await gameContract.methods.StakedSession(token.address, token.id).call();
  const progress = await gameContract.methods.sessionProgress(sessionId).call();
  const action = progress === "2" ? "abort" : progress === "6" ? "unstake" : undefined;
  if (!action) {
    return "Token is not staked";
  }
  console.log("unstaking...", { sessionId, progress });
  return axios
    .post(`${FULLCOUNT_PLAYER_API}/game/${action}`, postData, { headers })
    .then(async (response) => {
      const { gameContract } = getContracts();
      let isSuccess = false;
      for (let attempt = 1; attempt <= 30; attempt++) {
        console.log("checking token state after unstake, attempt: ", attempt);
        const session = await gameContract.methods.StakedSession(token.address, token.id).call();
        if (Number(session) === 0) {
          isSuccess = true;
          break;
        } else {
          console.log(session, response.data);
        }
        await delay(3 * 1000);
      }
      if (!isSuccess) {
        throw new Error("Time out. Something with server. Sorry. ");
      }
      console.log("Success:", response.data);
      sendReport(`${action === "abort" ? "Aborting" : "Unstaking"}`, {}, [
        "type:contract",
        `contract_method:${action}`,
      ]);
      return response.data;
    })
    .catch((e: any) => {
      sendReport(
        `${action === "abort" ? "Aborting" : "Unstaking"} failed`,
        { error: { message: e.message } },
        [
          "type:error",
          "error_domain:fcplayer",
          `error:fcplayer-${action}`,
          `token_address:${token.address}`,
          `token_id:${token.id}`,
        ],
      );
      throw e;
    });
};

function hexToDecimalString(hexValue: string): string {
  return BigInt(hexValue).toString();
}

export const commitOrRevealPitchFullcountPlayer = ({
  token,
  commit,
  isCommit,
  sessionID,
}: {
  commit: { nonce: string; vertical: number; horizontal: number; actionChoice: number };
  token: OwnedToken;
  isCommit: boolean;
  sessionID: number;
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
      const { gameContract } = getContracts();
      let isSuccess = false;
      if (!isCommit) {
        for (let attempt = 1; attempt <= 10; attempt++) {
          const sessionState = await gameContract.methods.SessionState(sessionID).call();
          if (sessionState.didPitcherReveal) {
            isSuccess = true;
            break;
          } else {
            console.log(sessionState, response.data);
          }
          console.log("checking sessionState after reveal, attempt: ", attempt);
          await delay(3 * 1000);
        }
        if (!isSuccess) {
          throw new Error("Reveal: FCPlayerAPI success, sessionState unchanged in 30sec");
        }
      } else {
        for (let attempt = 1; attempt <= 10; attempt++) {
          const sessionState = await gameContract.methods.SessionState(sessionID).call();
          if (sessionState.didPitcherCommit) {
            isSuccess = true;
            break;
          } else {
            console.log(sessionState, response.data);
          }
          console.log("checking sessionState after commit, attempt: ", attempt);
          await delay(3 * 1000);
        }
        if (!isSuccess) {
          throw new Error("Commit: FCPlayerAPI success, sessionState unchanged in 30sec");
        }
      }
      console.log("Success:", response.data);
      sendReport(`Move ${isCommit ? "committed" : "revealed"}`, {}, [
        "type:contract",
        `contract_method:${isCommit ? "CommitPitch" : "RevealPitch"}`,
        `token_address:${token.address}`,
        `token_id:${token.id}`,
      ]);
      return response.data;
    })
    .catch((e: any) => {
      sendReport(`${isCommit ? "commit" : "reveal"} failed`, { error: { message: e.message } }, [
        "type:error",
        "error_domain:fcplayer",
        `error:fcplayer-${isCommit ? "commit" : "reveal"}`,
        `token_address:${token.address}`,
        `token_id:${token.id}`,
      ]);
      throw e;
    });
};

export const commitOrRevealSwingFullcountPlayer = ({
  token,
  commit,
  isCommit,
  sessionID,
}: {
  commit: { nonce: string; vertical: number; horizontal: number; actionChoice: number };
  token: OwnedToken;
  isCommit: boolean;
  sessionID: number;
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
      const { gameContract } = getContracts();
      let isSuccess = false;
      if (!isCommit) {
        for (let attempt = 1; attempt <= 10; attempt++) {
          const sessionState = await gameContract.methods.SessionState(sessionID).call();
          if (sessionState.didBatterReveal) {
            isSuccess = true;
            break;
          }
          console.log("checking sessionState after reveal, attempt: ", attempt);
          await delay(3 * 1000);
        }
        if (!isSuccess) {
          throw new Error("Reveal: FCPlayerAPI success, sessionState unchanged in 30sec");
        }
      } else {
        for (let attempt = 1; attempt <= 10; attempt++) {
          const sessionState = await gameContract.methods.SessionState(sessionID).call();
          if (sessionState.didBatterCommit) {
            isSuccess = true;
            break;
          }
          console.log("checking sessionState after commit, attempt: ", attempt);
          await delay(3 * 1000);
        }
        if (!isSuccess) {
          throw new Error("Commit: FCPlayerAPI success, sessionState unchanged in 30sec");
        }
      }
      console.log("Success:", response.data);
      sendReport(`Move ${isCommit ? "committed" : "revealed"}`, {}, [
        "type:contract",
        `contract_method:${isCommit ? "CommitSwing" : "RevealSwing"}`,
        `token_address:${token.address}`,
        `token_id:${token.id}`,
      ]);
      return response.data;
    })
    .catch((e: any) => {
      sendReport(`${isCommit ? "commit" : "reveal"} failed`, { error: { message: e.message } }, [
        `token_address:${token.address}`,
        `token_id:${token.id}`,
        `type:error`,
        "error_domain:fcplayer",
        `error:fcplayer-${isCommit ? "commit" : "reveal"}`,
      ]);
      throw e;
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
      console.log("Success:", response.data);
      sendReport(`Token minted`, {}, ["type:contract", "contract_method:mint"]);
      return response.data;
    })
    .catch((e: any) => {
      sendReport(`minting failed`, { error: { message: e.message } }, [
        "type:error",
        "error_domain:fcplayer",
        `error:fcplayer-mint`,
      ]);
      throw e;
    });
};

export const getHeaders = () => {
  const ACCESS_TOKEN = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
  return {
    Authorization: `bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
};
