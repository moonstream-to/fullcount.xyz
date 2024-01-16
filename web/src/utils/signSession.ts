import { CHAIN_ID, GAME_CONTRACT, GAME_CONTRACT_VERSION } from "../constants";

const domain = {
  name: "Fullcount",
  version: GAME_CONTRACT_VERSION,
  chainId: String(CHAIN_ID),
  verifyingContract: String(GAME_CONTRACT),
};

export async function signSession(
  account: string,
  provider: any,
  sessionID: number,
): Promise<string> {
  if (!provider) throw new Error("signAccessToken: provider must be defined");
  if (!account) throw new Error("signAccessToken: account must be defined");

  const msgParams = JSON.stringify({
    domain,
    message: {
      sessionID,
    },
    primaryType: "SessionMessage",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      SessionMessage: [
        {
          type: "uint256",
          name: "sessionID",
        },
      ],
    },
  });

  return await provider.request({
    method: "eth_signTypedData_v4",
    params: [account, msgParams],
    from: account,
  });
}
