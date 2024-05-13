import axios from "axios";
import { Token, TokenId } from "../../types";
import { getTokensMetadata } from "../../tokenInterfaces/BLBTokenAPI";
import { LEADERBOARDS } from "../../constants";

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

export const fetchPositionForTokens = async (
  leaderboardId: string,
  tokens: TokenId[],
  tokensCache: Token[],
): Promise<LeaderboardEntry[]> => {
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
};

export const fetchWindowsForTokens = async (
  leaderboardId: string,
  tokens: TokenId[],
  tokensCache: Token[],
  windowSize: number,
): Promise<LeaderboardEntry[][]> => {
  const promises = tokens.map(async (t) => {
    const res = await axios.get(
      `https://engineapi.moonstream.to/leaderboard/position/?leaderboard_id=${leaderboardId}&address=${
        t.address
      }_${t.id}&normalize_addresses=false&window_size=${windowSize ?? 0}`,
    );
    return res.data;
  });
  const response = await Promise.all(promises);
  const windows = response.map((window: any) =>
    window.map((entry: { address: string }) => {
      const [address, id] = entry.address.split("_");
      return { ...entry, address, id };
    }),
  );

  const entries: any = response.flat().map((entry: { address: string }) => {
    const [address, id] = entry.address.split("_");
    return { ...entry, address, id };
  });
  const tokensMetadata = await getTokensMetadata(entries, tokensCache);
  return windows.map((window: any) =>
    window.map((entry: Token) => {
      const metadata = tokensMetadata.find((t) => t.id === entry.id && t.address === entry.address);
      return { ...entry, image: metadata?.image ?? "", name: metadata?.name ?? "" };
    }),
  );
};

export const fetchLeaderboardsPositions = async (token: Token) => {
  const promises = LEADERBOARDS.map(async (lb) => {
    const res = await axios.get(
      `https://engineapi.moonstream.to/leaderboard/position/?leaderboard_id=${lb.id}&address=${token.address}_${token.id}&normalize_addresses=false&window_size=0`,
    );
    return res.data;
  });
  const datas = await Promise.allSettled(promises);
  return datas
    .map((entry, idx) =>
      entry.status === "fulfilled" && entry.value[0]
        ? {
            title: LEADERBOARDS[idx]?.title,
            rank: entry.value[0].rank,
            score: entry.value[0].score,
          }
        : undefined,
    )
    .filter(Boolean)
    .sort((a, b) => a?.rank - b?.rank);
};

export interface LeaderboardPosition {
  token: Token;
  title: string;
  rank: number;
  score: number;
}

export const fetchAllLeaderboardsPositions = async (
  tokens: Token[],
): Promise<LeaderboardPosition[][]> => {
  const tokenPromises = tokens.map(async (token) => {
    const promises = LEADERBOARDS.map(async (lb) => {
      const res = await axios.get(
        `https://engineapi.moonstream.to/leaderboard/position/?leaderboard_id=${lb.id}&address=${token.address}_${token.id}&normalize_addresses=false&window_size=0`,
      );
      return res.data;
    });

    return (await Promise.allSettled(promises))
      .map((entry, idx) =>
        entry.status === "fulfilled" && entry.value[0]
          ? {
              title: LEADERBOARDS[idx]?.title,
              rank: entry.value[0].rank,
              score: entry.value[0].score,
              token,
            }
          : { title: LEADERBOARDS[idx]?.title, rank: Infinity, score: 0, token },
      )
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank);
  });

  return await Promise.all(tokenPromises);
};
