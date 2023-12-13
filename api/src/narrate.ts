import axios from "axios";
import { createPublicClient, defineChain, http } from "viem";

// Constants
const ZeroAddress = "0x0000000000000000000000000000000000000000"

// In-process cache of narrations
export type NarrationCache = { [k: string]: string }

export const cache: NarrationCache = {}

function cacheKey(sessionID: string, throwOutcome?: ThrowOutcome): string {
  if (!throwOutcome) {
    return `${sessionID}-0`
  }

  return `${sessionID}-1`
}

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
const FullcountContractAddress = "0x47E45451Af901E227901fa3F6e51c24145F70AF4";

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

const ThrowPreparation = `The pitcher has not yet thrown the ball.`

const ThrowFormat = `
If the pitch has not been played out yet, the outcome of the pitch will be represented as:
${ThrowPreparation}

In this case, you should create some suspense for the pitch in your commentary.

If the pitch has already been played out, the outcome of the pitch will be recorded as follows:
Outcome: <pitch speed> - <pitch vertical location> - <pitch horizontal location> - <pitch position> - <swing type> - <swing vertical location> - <swing horizontal location> - <swing position> - <outcome>

<pitch speed> can take one of two values -- "fast" or "slow"
You can treat fast pitches as fastballs and slow pitches as breaking balls or changeups, whichever you prefer. Base it on the pitch location if you can.

<swing type> can take one of three values -- "contact", "power", or "take"
"contact" means the batter is swinging for contact, "power" means the batter is swinging for the fences, and "take" means the batter is not swinging at all.

The <pitch position> and <swing position> are descriptions of where the pitch and swing are located and indicate whether they were made in or out of the strike zone. Please
use this to inform your commentary.
The <swing position> represents where the batter was expectinng the pitch to go. You should indicate this expectation in your commentary.

If the outcome is "in play out", this could be either a groundout or a flyout. Please make a judgement call on this based on the position of the swing relative to the pitch.

If the throw has an outcome, please do not do any setup in your commentary. We will already have displayed commentary to the user setting up the pitch. If there is already an outcome to the throw,
no need to tell users that we are in the bottom of the ninth, etc.
`

// Functions
const ChatCompletionURL = "https://api.openai.com/v1/chat/completions";

export interface ThrowOutcome {
  pitchSpeed: number;
  pitchVertical: number;
  pitchHorizontal: number;
  swingType: number;
  swingVertical: number;
  swingHorizontal: number;
  outcome: number;
}

function throwOutcomePrompt(throwOutcome: ThrowOutcome): string {
  let pitchSpeed = "unknown";
  switch (throwOutcome.pitchSpeed) {
    case 0:
      pitchSpeed = "fast"
      break;
    case 1:
      pitchSpeed = "slow"
      break;
  }

  let pitchVertical = "unknown";
  let pitchPosition = ""
  switch (throwOutcome.pitchVertical) {
    case 0:
      pitchVertical = "high"
      pitchPosition = "way high"
      break;
    case 1:
      pitchVertical = "high"
      pitchPosition = "high"
      break;
    case 2:
      pitchVertical = "middle"
      pitchPosition = "middle"
      break;
    case 3:
      pitchVertical = "low"
      pitchPosition = "low"
      break;
    case 4:
      pitchVertical = "low"
      pitchPosition = "way below"
      break
  }

  let pitchHorizontal = "unknown";
  switch (throwOutcome.pitchHorizontal) {
    case 0:
      pitchHorizontal = "inside"
      pitchPosition = `${pitchPosition} and way inside`
      break;
    case 1:
      pitchHorizontal = "inside"
      pitchPosition = `${pitchPosition} and inside`
      break;
    case 2:
      pitchHorizontal = "middle"
      pitchPosition = `${pitchPosition} and middle`
      break;
    case 3:
      pitchHorizontal = "outside"
      pitchPosition = `${pitchPosition} and outside`
      break;
    case 4:
      pitchHorizontal = "outside"
      pitchPosition = `${pitchPosition} and way outside`
      break
  }

  let swingType = "unknown";
  switch (throwOutcome.swingType) {
    case 0:
      swingType = "contact"
      break;
    case 1:
      swingType = "power"
      break;
    case 2:
      swingType = "take"
      break;
  }

  let swingVertical = "unknown";
  let swingPosition = ""
  switch (throwOutcome.swingVertical) {
    case 0:
      swingVertical = "high"
      swingPosition = "way high"
      break;
    case 1:
      swingVertical = "high"
      swingPosition = "high"
      break;
    case 2:
      swingVertical = "middle"
      swingPosition = "middle"
      break;
    case 3:
      swingVertical = "low"
      swingPosition = "low"
      break;
    case 4:
      swingVertical = "low"
      swingPosition = "way below"
      break
  }

  let swingHorizontal = "unknown";
  switch (throwOutcome.swingHorizontal) {
    case 0:
      swingHorizontal = "inside"
      swingPosition = `${swingPosition} and way inside`
      break;
    case 1:
      swingHorizontal = "inside"
      swingPosition = `${swingPosition} and inside`
      break;
    case 2:
      swingHorizontal = "middle"
      swingPosition = `${swingPosition} and middle`
      break;
    case 3:
      swingHorizontal = "outside"
      swingPosition = `${swingPosition} and outside`
      break;
    case 4:
      swingHorizontal = "outside"
      swingPosition = `${swingPosition} and way outside`
      break
  }

  let outcome = "unknown";
  switch (throwOutcome.outcome) {
    case 0:
      outcome = "strikeout"
      break;
    case 1:
      outcome = "walk"
      break;
    case 2:
      outcome = "single"
      break;
    case 3:
      outcome = "double"
      break;
    case 4:
      outcome = "triple"
      break;
    case 5:
      outcome = "home run"
      break;
    case 6:
      outcome = "in play out"
      break;
  }

  //  Outcome: <pitch speed> - <pitch vertical location> - <pitch horizontal location> - <pitch position> - <swing type> - <swing vertical location> - <swing horizontal location> - <swing position> - <outcome>
  return `Outcome: ${pitchSpeed} - ${pitchVertical} - ${pitchHorizontal} - ${pitchPosition} - ${swingType} - ${swingVertical} - ${swingHorizontal} - ${swingPosition} - ${outcome}`
}

export function narrateThrowMessages(pitcherName: string, pitcherDescription: string, batterName: string, batterDescription: string, throwOutcome?: ThrowOutcome): object[] {
  let messages = [
    { role: "system", content: ThrowConfiguration },
    { role: "user", content: PlayerFormat },
  ]

  if (pitcherName) {
    messages.push({
      role: "user",
      content:
        `Pitcher - ${pitcherName} - ${pitcherDescription}`,
    })
  }

  if (batterName) {
    messages.push({
      role: "user",
      content:
        `Batter - ${batterName} - ${batterDescription}`,
    })
  }

  messages.push({ role: "system", content: ThrowFormat })

  if (!throwOutcome) {
    messages.push({ role: "user", content: ThrowPreparation })
  } else {
    messages.push({ role: "user", content: throwOutcomePrompt(throwOutcome) })
  }

  messages.push({ role: "system", content: CommentaryRequirements })

  return messages
}

export async function narrateThrow(pitcherName: string, pitcherDescription: string, batterName: string, batterDescription: string, throwOutcome?: ThrowOutcome): Promise<string> {
  const messages = narrateThrowMessages(pitcherName, pitcherDescription, batterName, batterDescription, throwOutcome)

  const completionResponse = await axios.post(
    ChatCompletionURL,
    {
      model: "gpt-3.5-turbo",
      messages,
      temperature: 1.1,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  const message = completionResponse.data.choices[0].message as any;
  return message.content as string;
}

export async function narrateThrowBySessionID(sessionID: string): Promise<string> {
  const throwState: any = await web3Client.readContract({
    address: FullcountContractAddress,
    abi: FullcountSessionABI,
    functionName: "getSession",
    args: [sessionID],
  });

  let throwOutcome: ThrowOutcome | undefined = undefined;
  if (throwState.didPitcherReveal && throwState.didBatterReveal) {
    throwOutcome = {
      pitchSpeed: throwState.pitcherReveal.speed,
      pitchVertical: throwState.pitcherReveal.vertical,
      pitchHorizontal: throwState.pitcherReveal.horizontal,
      swingType: throwState.batterReveal.kind,
      swingVertical: throwState.batterReveal.vertical,
      swingHorizontal: throwState.batterReveal.horizontal,
      outcome: throwState.outcome,
    }
  }

  const key = cacheKey(sessionID, throwOutcome)
  if (cache[key]) {
    return cache[key]
  }

  const pitcherNFTAddress = throwState.pitcherNFT.nftAddress;
  const pitcherTokenID = throwState.pitcherNFT.tokenID;

  const batterNFTAddress = throwState.batterNFT.nftAddress;
  const batterTokenID = throwState.batterNFT.tokenID;

  const dataURIPrefix = "data:application/json;base64,"

  let pitcherNFTMetadata = { name: "", description: "" };

  if (pitcherNFTAddress !== ZeroAddress) {
    const pitcherNFTURI: string = await web3Client.readContract({
      address: pitcherNFTAddress,
      abi: ERC721TokenInfoABI,
      functionName: "tokenURI",
      args: [pitcherTokenID],
    }) as string;

    if (pitcherNFTURI.startsWith(dataURIPrefix)) {
      pitcherNFTMetadata = JSON.parse(atob(pitcherNFTURI.slice(dataURIPrefix.length)))
    } else {
      const pitcherNFTResponse = await axios.get(pitcherNFTURI)
      pitcherNFTMetadata = pitcherNFTResponse.data
    }
  }


  let batterNFTMetadata = { name: "", description: "" }


  if (batterNFTAddress !== ZeroAddress) {
    const batterNFTURI: string = await web3Client.readContract({
      address: batterNFTAddress,
      abi: ERC721TokenInfoABI,
      functionName: "tokenURI",
      args: [batterTokenID],
    }) as string;

    if (batterNFTURI.startsWith(dataURIPrefix)) {
      batterNFTMetadata = JSON.parse(atob(batterNFTURI.slice(dataURIPrefix.length)))
    } else {
      const batterNFTResponse = await axios.get(batterNFTURI)
      batterNFTMetadata = batterNFTResponse.data
    }
  }

  const pitcherName = pitcherNFTMetadata.name || "";
  const pitcherDescription = pitcherNFTMetadata.description || "";

  const batterName = batterNFTMetadata.name || "";
  const batterDescription = batterNFTMetadata.description || "";

  const narration = await narrateThrow(pitcherName, pitcherDescription, batterName, batterDescription, throwOutcome)

  cache[key] = narration
  return narration
}
