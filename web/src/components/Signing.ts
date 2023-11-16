import { CHAIN_ID, GAME_CONTRACT, GAME_CONTRACT_VERSION } from "../constants";

const domain = {
  name: "Fullcount",
  version: GAME_CONTRACT_VERSION,
  chainId: String(CHAIN_ID),
  verifyingContract: String(GAME_CONTRACT),
};

export async function signPitch(
  account: string,
  provider: any,
  nonce: string,
  speed: number,
  vertical: number,
  horizontal: number,
): Promise<string> {
  if (!provider) throw new Error("signAccessToken: provider must be defined");
  if (!account) throw new Error("signAccessToken: account must be defined");

  const msgParams = JSON.stringify({
    domain,
    message: {
      nonce,
      speed,
      vertical,
      horizontal,
    },
    primaryType: "PitchMessage",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      PitchMessage: [
        {
          type: "uint256",
          name: "nonce",
        },
        {
          type: "uint256",
          name: "speed",
        },
        {
          type: "uint256",
          name: "vertical",
        },
        {
          type: "uint256",
          name: "horizontal",
        },
      ],
    },
  });

  const result = await provider.request({
    method: "eth_signTypedData_v4",
    params: [account, msgParams],
    from: account,
  });

  return result;
}

export async function signSwing(
  account: string,
  provider: any,
  nonce: string,
  kind: number,
  vertical: number,
  horizontal: number,
): Promise<string> {
  if (!provider) throw new Error("signAccessToken: provider must be defined");
  if (!account) throw new Error("signAccessToken: account must be defined");

  const msgParams = JSON.stringify({
    domain,
    message: {
      nonce,
      kind,
      vertical,
      horizontal,
    },
    primaryType: "SwingMessage",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      SwingMessage: [
        {
          type: "uint256",
          name: "nonce",
        },
        {
          type: "uint256",
          name: "kind",
        },
        {
          type: "uint256",
          name: "vertical",
        },
        {
          type: "uint256",
          name: "horizontal",
        },
      ],
    },
  });

  const result = await provider.request({
    method: "eth_signTypedData_v4",
    params: [account, msgParams],
    from: account,
  });

  return result;
}
