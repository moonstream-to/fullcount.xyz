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
    domain: {
      name: "Fullcount",
      version: "0.0.2",
      chainId: "80001",
      verifyingContract: "0x83930B5AaB9Fd82022De284F016f5C53e4749C9F",
    },
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
    domain: {
      name: "Fullcount",
      version: "0.0.2",
      chainId: "80001",
      verifyingContract: "0x83930B5AaB9Fd82022De284F016f5C53e4749C9F",
    },
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
