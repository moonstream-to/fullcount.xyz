import axios from "axios";
import { Token, TokenId } from "../../types";
import { getTokensMetadata } from "../../tokenInterfaces/BLBTokenAPI";

export interface LeaderboardEntry {
  address: string;
  id: string;
  rank: number;
  score: number;
  image: string;
  name: string;
}

export async function fetchLeaderboardData(
  leaderboardId: string,
  limit: number,
  offset: number,
  tokensCache: Token[],
): Promise<LeaderboardEntry[]> {
  const response = await axios.get(
    `https://engineapi.moonstream.to/leaderboard/?leaderboard_id=${leaderboardId}&limit=${limit}&offset=${offset}`,
  );
  console.log(response.data);
  const entries = response.data.map((entry: { address: string }) => {
    const [address, id] = entry.address.split("_");
    return { ...entry, address, id };
  });
  const tokensMetadata = await getTokensMetadata(entries, tokensCache);
  return entries.map((entry: Token) => {
    const metadata = tokensMetadata.find((t) => t.id === entry.id && t.address === entry.address);
    return { ...entry, image: metadata?.image ?? "", name: metadata?.name ?? "" };
  });
}

export async function fetchPositionForTokens(
  leaderboardId: string,
  tokens: TokenId[],
  tokensCache: Token[],
): Promise<LeaderboardEntry[]> {
  const promises = tokens.map(async (t) => {
    const res = await axios.get(
      `https://engineapi.moonstream.to/leaderboard/position/?leaderboard_id=${leaderboardId}&address=${t.address}_${t.id}&normalize_addresses=false&window_size=0`,
    );
    return res.data;
  });
  const response = await Promise.all(promises);

  const entries: any = response
    .flat()
    .sort((a, b) => a.rank - b.rank)
    .map((entry: { address: string }) => {
      const [address, id] = entry.address.split("_");
      return { ...entry, address, id };
    });
  const tokensMetadata = await getTokensMetadata(entries, tokensCache);
  return entries.map((entry: Token) => {
    const metadata = tokensMetadata.find((t) => t.id === entry.id && t.address === entry.address);
    return { ...entry, image: metadata?.image ?? "", name: metadata?.name ?? "" };
  });
}
