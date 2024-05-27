import { AtBatStatus, Token, TokenId } from "../types";
import { FULLCOUNT_PLAYER_API, GAME_CONTRACT, ZERO_ADDRESS } from "../constants";
import axios from "axios";
import { getContracts } from "../utils/getWeb3Contracts";
import { sendReport } from "../utils/humbug";
import { delay, getHeaders, unstakeFullcountPlayer } from "./FullcountPlayerAPI";
import { getTokensData } from "./BLBTokenAPI";

export async function startSessionTrustedExecutor({
  token,
  roleNumber,
  requireSignature,
}: {
  token: Token;
  roleNumber: number;
  requireSignature: boolean;
}): Promise<{ sessionID: string; sign: string | undefined }> {
  const postData = {
    nft: { erc721_address: token.address, token_id: token.id },
  };
  const headers = getHeaders();
  // await unstakeFullcountPlayer({ token });

  const data = await axios
    .post(`${FULLCOUNT_PLAYER_API}/trusted/start`, postData, { headers })
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
  return { sessionID: data.session_id, sign: data.signature };
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
      (t) => t.address === state.batter_nft.erc721_address && t.id === state.batter_nft.token_id,
    ),
    batter: tokens.find(
      (t) => t.address === state.batter_nft.erc721_address && t.id === state.batter_nft.token_id,
    ),
    balls: state.balls,
    strikes: state.strikes,
    outcome: state.outcome,
    pitches: [],
    numberOfSessions: state.current_session_index,
    id,
  };
  return { atBat, tokens };
};
