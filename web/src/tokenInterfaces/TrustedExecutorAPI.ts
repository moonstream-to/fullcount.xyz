import {
  AtBat,
  AtBatStatus,
  OpenAtBat,
  Token,
  TokenId,
  TrustedExecutionAtBatState,
  Swing,
  Pitch,
  SessionStatus,
  PitcherReveal,
  BatterReveal,
} from "../types";
import { FULLCOUNT_PLAYER_API, GAME_CONTRACT, ZERO_ADDRESS } from "../constants";
import axios from "axios";
import { getContracts } from "../utils/getWeb3Contracts";
import { sendReport } from "../utils/humbug";
import { delay, getHeaders, unstakeFullcountPlayer } from "./FullcountPlayerAPI";
import { getTokensData } from "./BLBTokenAPI";
import { emptyPitch } from "../components/atbat/OnboardingAPI";
import atBatView from "../components/atbat/AtBatView";

export async function startSessionTrustedExecutor({
  token,
  role,
  requireSignature,
}: {
  token: Token;
  role: 0 | 1;
  requireSignature: boolean;
}): Promise<{ sessionID: undefined; atBatID: string; inviteCode: string | undefined }> {
  const postData = {
    nft: { erc721_address: token.address, token_id: token.id },
    role,
    requireSignature,
  };
  const headers = getHeaders();

  const state = await axios
    .post(`${FULLCOUNT_PLAYER_API}/trusted/start`, postData, { headers })
    .then(async (response) => {
      console.log("Success:", response.data);
      return response.data.state;
    });
  sendReport("Session started", {}, [
    "type:contract",
    "contract_method:start",
    `token_address:${token.address}`,
    `token_id:${token.id}`,
  ]);
  return { atBatID: state.at_bat_id, inviteCode: undefined, sessionID: undefined };
}

export const getAtBatTrustedExecutor = async (id: string, tokensCache: Token[]) => {
  const state = await axios
    .get(`${FULLCOUNT_PLAYER_API}/trusted/state?at_bat_id=${id}`)
    .then((res) => res.data.state);
  const newTokens: TokenId[] = [];
  console.log(state);

  if (
    !tokensCache.some(
      (t) => t.address === state.pitcher_nft.erc721_address && t.id === state.pitcher_nft.token_id,
    ) &&
    state.pitcher_nft.erc721_address !== "" &&
    !newTokens.some(
      (t) => t.address === state.pitcher_nft.erc721_address && t.id === state.pitcher_nft.token_id,
    )
  ) {
    newTokens.push({ address: state.pitcher_nft.erc721_address, id: state.pitcher_nft.token_id });
  }
  if (
    !tokensCache.some(
      (t) => t.address === state.batter_nft.erc721_address && t.id === state.batter_nft.token_id,
    ) &&
    state.batter_nft.erc721_address !== "" &&
    !newTokens.some(
      (t) => t.address === state.batter_nft.erc721_address && t.id === state.batter_nft.token_id,
    )
  ) {
    newTokens.push({ address: state.batter_nft.erc721_address, id: state.batter_nft.token_id });
  }

  const newTokensData = await getTokensData({ tokens: newTokens, tokensSource: "BLBContract" });
  const tokens = [...tokensCache, ...newTokensData];
  const pitches: SessionStatus[] = [];
  if (state.sessions) {
    state.sessions.forEach((_: any, idx: number) => pitches.push(getPitch(state, idx + 1)));
  }
  if (state.outcome === 0) {
    pitches.push(getPitch(state, state.current_session_index));
  }
  const atBat: AtBatStatus = {
    pitcher: tokens.find(
      (t) => t.address === state.pitcher_nft.erc721_address && t.id === state.pitcher_nft.token_id,
    ),
    batter: tokens.find(
      (t) => t.address === state.batter_nft.erc721_address && t.id === state.batter_nft.token_id,
    ),
    balls: state.balls,
    strikes: state.strikes,
    outcome: state.outcome,
    pitches,
    numberOfSessions: state.current_session_index,
    id,
  };
  return { atBat, tokens };
};

const getPitch = (state: TrustedExecutionAtBatState, idx: number): SessionStatus => {
  if (state.current_session_index === idx && state.outcome === 0) {
    return {
      progress: state.join_timestamp ? 3 : 2, //TODO session.timestamp
      outcome: 0,
      sessionID: idx,
      didPitcherCommit: !state.pitcher_can_act,
      didBatterCommit: !state.batter_can_act,
      didPitcherReveal: !state.pitcher_can_act,
      didBatterReveal: !state.batter_can_act,
      pitcherReveal: { nonce: "0", speed: "0", vertical: "0", horizontal: "0" },
      batterReveal: {
        nonce: "0",
        kind: "0",
        vertical: "0",
        horizontal: "0",
      },
      phaseStartTimestamp: String(state.join_timestamp),
    };
  }
  if (!state.sessions) {
    throw new Error("unexpected error parsing at-bat state");
  }
  return {
    progress: 5,
    outcome: state.sessions[idx - 1].outcome,
    sessionID: idx,
    didPitcherCommit: true,
    didBatterCommit: true,
    didPitcherReveal: true,
    didBatterReveal: true,
    pitcherReveal: pitchToPitchReveal(state.sessions[idx - 1].pitch),
    batterReveal: swingToBatterReveal(state.sessions[idx - 1].swing),
    phaseStartTimestamp: String(state.sessions[idx - 1].timestamp),
  };
};

const pitchToPitchReveal = (pitch: Pitch): PitcherReveal => {
  const { nonce, speed, vertical, horizontal } = pitch;
  return {
    nonce,
    speed: String(speed),
    horizontal: String(horizontal),
    vertical: String(vertical),
  };
};

const swingToBatterReveal = (swing: Swing): BatterReveal => {
  const { nonce, kind, vertical, horizontal } = swing;
  return {
    nonce,
    kind: String(kind),
    horizontal: String(horizontal),
    vertical: String(vertical),
  };
};

export const joinAtBatTrustedExecutor = async ({
  token,
  atBatID,
}: {
  token: Token;
  atBatID: string;
}) => {
  const postData = {
    nft: { erc721_address: token.address, token_id: token.id },
    at_bat_id: atBatID,
  };
  const headers = getHeaders();
  // await unstakeFullcountPlayer({ token });

  const data = await axios
    .post(`${FULLCOUNT_PLAYER_API}/trusted/join`, postData, { headers })
    .then(async (response) => {
      console.log("Success:", response.data);
      return response.data;
    });
  sendReport("Session started", {}, [
    "type:contract",
    "contract_method:start",
    `token_address:${token.address}`,
    `token_id:${token.id}`,
  ]);
  return data;
};

export const abortAtBatTrustedExecutor = async ({
  token,
  atBatID,
}: {
  token: Token;
  atBatID: string;
}) => {
  const postData = {
    nft: { erc721_address: token.address, token_id: token.id },
    at_bat_id: atBatID,
  };
  const headers = getHeaders();
  // await unstakeFullcountPlayer({ token });

  const data = await axios
    .post(`${FULLCOUNT_PLAYER_API}/trusted/abort`, postData, { headers })
    .then(async (response) => {
      console.log("Success:", response.data);
      return response.data;
    });
  sendReport("Session started", {}, [
    "type:contract",
    "contract_method:start",
    `token_address:${token.address}`,
    `token_id:${token.id}`,
  ]);
  return data;
};

const fetchCurrentAtBat = (token: Token): Promise<TrustedExecutionAtBatState> => {
  const headers = getHeaders();
  return axios
    .get(
      `${FULLCOUNT_PLAYER_API}/trusted/current?token_address=${token.address}&token_id=${token.id}`,
      { headers },
    )
    .then((res) => res.data.state);
};

export const fetchAllCurrentAtBats = async (
  tokens: Token[],
): Promise<(TrustedExecutionAtBatState | undefined)[]> => {
  const promises = tokens.map((token) => fetchCurrentAtBat(token));
  const results = await Promise.allSettled(promises);
  console.log(results);
  return results.map((result) => (result.status === "fulfilled" ? result.value : undefined));
};

export const fetchOpenTrustedExecutorAtBats = async (
  tokensCache: Token[],
): Promise<{ atBats: AtBat[]; tokens: Token[] }> => {
  const atBats = await axios
    .get(`${FULLCOUNT_PLAYER_API}/trusted/open`)
    .then((res) => res.data.open_at_bats ?? []);
  console.log(atBats);
  const newTokens: TokenId[] = [];
  atBats.forEach((a: OpenAtBat) => {
    if (
      !tokensCache.some((t) => t.address === a.nft.erc721_address && t.id === a.nft.token_id) &&
      a.nft.erc721_address !== ZERO_ADDRESS &&
      !newTokens.some((t) => t.address === a.nft.erc721_address && t.id === a.nft.token_id)
    ) {
      newTokens.push({ address: a.nft.erc721_address, id: a.nft.token_id });
    }
  });
  console.log(tokensCache, newTokens);
  const newTokensData = await getTokensData({ tokens: newTokens, tokensSource: "BLBContract" });
  const tokens = [...tokensCache, ...newTokensData];
  return {
    atBats: atBats
      .map((a: OpenAtBat, idx: number) => ({
        ...a,
        balls: 0,
        outcome: 0,
        strikes: 0,
        pitcher:
          a.Role === 0
            ? tokens.find((t) => t.address === a.nft.erc721_address && t.id === a.nft.token_id)
            : undefined,
        batter:
          a.Role === 1
            ? tokens.find((t) => t.address === a.nft.erc721_address && t.id === a.nft.token_id)
            : undefined,
        id: a.at_bat_id,
        numberOfSessions: 1,
        lastSessionId: 0,
        progress: 2,
        requiresSignature: !!a.invite_code,
      }))
      .reverse(),
    tokens,
  };
};

export const swingTrustedExecutor = async ({
  atBatID,
  token,
  swing,
  index,
  signature,
}: {
  atBatID: string;
  token: Token;
  swing: Swing;
  index: number;
  signature?: string;
}) => {
  const headers = getHeaders();

  let _signature = signature;

  if (!signature) {
    const postDataSignature = {
      at_bat_id: atBatID,
      fullcount_address: GAME_CONTRACT,
      erc721_address: token.address,
      token_id: token.id,
      role: 1,
    };
    _signature = await axios
      .post(`${FULLCOUNT_PLAYER_API}/trusted/signature`, postDataSignature, { headers })
      .then((res) => res.data.signature);
    console.log(_signature);
  }
  if (!_signature) {
    throw new Error("Can't retrieve signature");
  }

  const postData = {
    at_bat_id: atBatID,
    fullcount_address: GAME_CONTRACT,
    nft: { erc721_address: token.address, token_id: token.id },
    swing,
    index,
    signature: _signature,
  };
  return await axios
    .post(`${FULLCOUNT_PLAYER_API}/trusted/swing`, postData, { headers })
    .then((res) => res.data);
};

export const pitchTrustedExecutor = async ({
  atBatID,
  token,
  pitch,
  index,
  signature,
}: {
  atBatID: string;
  token: Token;
  pitch: Pitch;
  index: number;
  signature?: string;
}) => {
  const headers = getHeaders();

  let _signature = signature;

  if (!signature) {
    const postDataSignature = {
      at_bat_id: atBatID,
      fullcount_address: GAME_CONTRACT,
      erc721_address: token.address,
      token_id: token.id,
      role: 0,
    };
    _signature = await axios
      .post(`${FULLCOUNT_PLAYER_API}/trusted/signature`, postDataSignature, { headers })
      .then((res) => res.data.signature);
    console.log(_signature);
  }
  if (!_signature) {
    throw new Error("Can't retrieve signature");
  }

  const postData = {
    at_bat_id: atBatID,
    fullcount_address: GAME_CONTRACT,
    nft: { erc721_address: token.address, token_id: token.id },
    pitch,
    index,
    signature: _signature,
  };
  return await axios
    .post(`${FULLCOUNT_PLAYER_API}/trusted/pitch`, postData, { headers })
    .then((res) => res.data);
};
