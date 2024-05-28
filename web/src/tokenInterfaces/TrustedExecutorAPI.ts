import { AtBatStatus, Token, TokenId, TrustedExecutionAtBatState } from "../types";
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
    pitches: state.current_session_index === 1 ? [{ ...emptyPitch, progress: 2 }] : [],
    numberOfSessions: state.current_session_index,
    id,
  };
  return { atBat, tokens };
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
  return results.map((result) => (result.status === "fulfilled" ? result.value : undefined));
};
