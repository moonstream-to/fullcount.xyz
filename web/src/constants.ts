export const GAME_CONTRACT_VERSION = "0.1.1"; //TODO fetch from contract
export const SECOND_REVEAL_PRICE_MULTIPLIER = 3;

export const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd07GHBQ4BN5MiMfLhjKm-Y_s8_SZ_zAOD3OhavDlm974kotg/viewform";

export const GET_CONNECTED_URL = "https://forms.gle/Nk1bT1iLBYRDdyND9";

const MULTICALL2_POLYGON_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_MULTICALL2_POLYGON_CONTRACT_ADDRESS;
const MULTICALL2_MUMBAI_CONTRACT_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
const MULTICALL2_WYRM_CONTRACT_ADDRESS = "0x23a327296EB6c4ac98318A702A7Fe1082b922c0b";
const MULTICALL3_SEPOLIA_CONTRACT_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

export const MULTICALL2_CONTRACT_ADDRESSES = {
  "137": MULTICALL2_POLYGON_CONTRACT_ADDRESS,
  "80001": MULTICALL2_MUMBAI_CONTRACT_ADDRESS,
  "322": MULTICALL2_WYRM_CONTRACT_ADDRESS,
  "421614": MULTICALL3_SEPOLIA_CONTRACT_ADDRESS,
  "42170": MULTICALL3_SEPOLIA_CONTRACT_ADDRESS,
};

export const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const AWS_STATIC_ASSETS_PATH = "https://static.simiotics.com/moonstream/assets";

export const FULLCOUNT_ASSETS_PATH = "https://static.simiotics.com/fullcount";
export const FULLCOUNT_ASSETS = "https://static.fullcount.xyz/web";
export const TOKEN_IMAGE_FALLBACK = `${FULLCOUNT_ASSETS_PATH}/question.png`;

export const DISCORD_LINK = "https://discord.com/invite/FEppMCDZsM";
export const TWITTER_LINK = "https://twitter.com/fullcount_xyz";
export const HYPERPLAY_LINK =
  "https://fullcount.xyz/landing/?utm_source=hyperplay%20&utm_medium=referral&utm_campaign=fullcount_launch";
export const TRAILER_LINK = "https://youtu.be/O9t7s75FOF0?si=Vkg6rBdQ9b55Kx4m";

export type ChainName = "ethereum" | "localhost" | "mumbai" | "polygon" | "wyrm" | "gnosis";
export type ChainId = 1 | 1337 | 80001 | 137 | 322 | 100;

// map chain names to image paths
const chainNameToImagePath: Record<string, string> = {
  ethereum: `${AWS_STATIC_ASSETS_PATH}/icons/eth-outline.png`,
  localhost: `${AWS_STATIC_ASSETS_PATH}/icons/localhost-outline.png`,
  mumbai: `${AWS_STATIC_ASSETS_PATH}/icons/polygon-outline.png`,
  polygon: `${AWS_STATIC_ASSETS_PATH}/icons/polygon-outline.png`,
  wyrm: `${AWS_STATIC_ASSETS_PATH}/icons/wyrm-small-fill.png`,
  gnosis: `${AWS_STATIC_ASSETS_PATH}/icons/gnosis.png`,
  xdai: `${AWS_STATIC_ASSETS_PATH}/icons/gnosis.png`,
};

// map chain IDs to image paths
const chainIdToImagePath: Record<ChainId, string> = {
  1: `${AWS_STATIC_ASSETS_PATH}/icons/eth-outline.png`,
  1337: `${AWS_STATIC_ASSETS_PATH}/icons/localhost-outline.png`,
  80001: `${AWS_STATIC_ASSETS_PATH}/icons/polygon-outline.png`,
  137: `${AWS_STATIC_ASSETS_PATH}/icons/polygon-outline.png`,
  322: `${AWS_STATIC_ASSETS_PATH}/icons/wyrm-small-fill.png`,
  100: `${AWS_STATIC_ASSETS_PATH}/icons/gnosis.png`,
};

export const getChainImage = (identifier: string | number): string | undefined => {
  if (identifier in chainNameToImagePath) {
    return chainNameToImagePath[identifier as ChainName];
  } else if (identifier in chainIdToImagePath) {
    return chainIdToImagePath[identifier as ChainId];
  }
};

export const APPLICATION_ID = "6a97c2fa-e485-4073-9b5f-a533f4718837"; //TODO env
export const FULLCOUNT_PLAYER_API = "https://player.fullcount.xyz"; //TODO env
export const GAME_CONTRACT = "0xDfE251B4F12547867ff839bcacec4d159DD68E47"; //TODO env
export const TOKEN_CONTRACT = "0xf40c0961A9CC5c037B92D2cb48167F7f62Dd7cD0"; //TODO env
export const CHAIN_ID = 42170;
export const RPC = "https://nova.arbitrum.io/rpc";

export const blbImage = (idx: number) =>
  `https://static.fullcount.xyz/Beer_League_Ballers/small/p${idx}.png`;
export const HUMBUG_REPORT_VERSION = "0.0.3";

export const LEADERBOARD_HOME_RUNS = "0f061af5-22a7-4449-a4e3-b0efe3a5a3d8";
export const LEADERBOARD_ON_BASE_PERCENTAGE = "941f5bfb-b6c9-4ff5-8442-8beae42009ee";
export const LEADERBOARD_TOTAL_AT_BATS = "a715d48c-1155-4821-9898-471ef0aa69aa";
export const LEADERBOARD_STRIKEOUTS = "7b2fd9a2-98bc-4c5d-acfb-983111d623bb";
export const LEADERBOARD_PITCHING_OUTS = "1ce582b4-409a-4102-af11-d85d08247029";

export const LEADERBOARDS = [
  { id: "0f061af5-22a7-4449-a4e3-b0efe3a5a3d8", title: "Home runs" },
  { id: "7b2fd9a2-98bc-4c5d-acfb-983111d623bb", title: "Strikeouts" },
  { id: "1ce582b4-409a-4102-af11-d85d08247029", title: "Outs" },
  { id: "941f5bfb-b6c9-4ff5-8442-8beae42009ee", title: "On-base %" },
  { id: "a715d48c-1155-4821-9898-471ef0aa69aa", title: "Appearances" },
];
