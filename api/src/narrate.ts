import axios from "axios";
import { createPublicClient, defineChain, http } from "viem";

// Blockchain
const wyrm = defineChain({
  id: 322,
  name: "Wyrm",
  network: "wyrm",
  nativeCurrency: {
    decimals: 18,
    name: "cMATIC",
    symbol: "cMATIC",
  },
  rpcUrls: {
    default: {
      http: ["https://wyrm.constellationchain.xyz/http"],
    },
    public: {
      http: ["https://wyrm.constellationchain.xyz/http"],
    },
  },
});

// Contract address
const FullcountContractAddress = "0x391FFCcea2BC1a615e2d4923fFd9373278707504";

// ABIs
const FullcountSessionABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "sessionID",
        type: "uint256",
      },
    ],
    name: "getSession",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "phaseStartTimestamp",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "nftAddress",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "tokenID",
                type: "uint256",
              },
            ],
            internalType: "struct NFT",
            name: "pitcherNFT",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "didPitcherCommit",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "didPitcherReveal",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "pitcherCommit",
            type: "bytes",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "nonce",
                type: "uint256",
              },
              {
                internalType: "enum PitchSpeed",
                name: "speed",
                type: "uint8",
              },
              {
                internalType: "enum VerticalLocation",
                name: "vertical",
                type: "uint8",
              },
              {
                internalType: "enum HorizontalLocation",
                name: "horizontal",
                type: "uint8",
              },
            ],
            internalType: "struct Pitch",
            name: "pitcherReveal",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "nftAddress",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "tokenID",
                type: "uint256",
              },
            ],
            internalType: "struct NFT",
            name: "batterNFT",
            type: "tuple",
          },
          {
            internalType: "bool",
            name: "didBatterCommit",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "didBatterReveal",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "batterCommit",
            type: "bytes",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "nonce",
                type: "uint256",
              },
              {
                internalType: "enum SwingType",
                name: "kind",
                type: "uint8",
              },
              {
                internalType: "enum VerticalLocation",
                name: "vertical",
                type: "uint8",
              },
              {
                internalType: "enum HorizontalLocation",
                name: "horizontal",
                type: "uint8",
              },
            ],
            internalType: "struct Swing",
            name: "batterReveal",
            type: "tuple",
          },
          {
            internalType: "enum Outcome",
            name: "outcome",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "pitcherLeftSession",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "batterLeftSession",
            type: "bool",
          },
        ],
        internalType: "struct Session",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "sessionID",
        type: "uint256",
      },
    ],
    name: "sessionProgress",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const ERC721TokenInfoABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Client
const web3Client = createPublicClient({
  chain: wyrm,
  transport: http(),
});

// Types
export interface NFT {
  nftAddress: string;
  tokenID: string;
}

export interface Pitch {
  nonce: string;
  speed: string;
  vertical: string;
  horizontal: string;
}

export interface Swing {
  nonce: string;
  kind: string;
  vertical: string;
  horizontal: string;
}

export interface Session {
  phaseStartTimestamp: number;
  pitcherNFT: NFT;
  didPitcherCommit: boolean;
  didPitcherReveal: boolean;
  pitcherCommit: string;
  pitcherReveal: Pitch;
  batterNFT: NFT;
  didBatterCommit: boolean;
  didBatterReveal: boolean;
  batterCommit: string;
  batterReveal: Swing;
  outcome: number;
  pitcherLeftSession: boolean;
  batterLeftSession: boolean;
}

// Prompts
const ThrowConfiguration = `
You are a baseball commentator for an American television channel. You are commenting
on a baseball game which is in the bottom of its 9th inning. The bases are loaded and the count is full.
This is a high pressure situation for both the pitcher and the batter.
`;

const PlayerFormat = `
Below is some information about the players of this game. It is not necessarily exhaustive and may not
cover all the players in the game.

The information is provided in the format:
<player position> - <player name> - <player description (this is optional and may not be provided)>
`;

const CommentaryRequirements = `
Please provide commentary on the situation, providing some color. In the style of a baseball commentator
from the 1930s. Keep your commentary short and concise - maximum 3 concise, clear sentences. No flowery
language. Feel free to use sound effects like <crack>, <thud>, <smack>, etc.
`;

// Functions
const ChatCompletionURL = "https://api.openai.com/v1/chat/completions";

export async function narrate(session: Session): Promise<string> {
  const completionResponse = await axios.post(
    ChatCompletionURL,
    {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: ThrowConfiguration },
        { role: "user", content: PlayerFormat },
        {
          role: "user",
          content:
            "Pitcher - Jim Palmer - Jim Palmer is a right-handed pitcher who played for the Baltimore Orioles from 1965 to 1984. He was inducted into the Baseball Hall of Fame in 1990.",
        },
        {
          role: "user",
          content:
            "Batter - Roid Rage - This guy is juiced up and looking to hit a home RUN",
        },
        { role: "system", content: CommentaryRequirements },
      ],
      temperature: 1.5,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return JSON.stringify(completionResponse.data.choices[0].message) as string;
}
