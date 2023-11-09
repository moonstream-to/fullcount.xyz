export async function signPitch(
  account: string,
  provider: any,
  nonce: number,
  speed: number,
  vertical: number,
  horizontal: number,
): Promise<string> {
  // if (duration <= 0 || duration == undefined)
  //   throw new Error("signAccessToken: duration must be defined");
  if (!provider) throw new Error("signAccessToken: provider must be defined");
  if (!account) throw new Error("signAccessToken: account must be defined");

  const msgParams = JSON.stringify({
    domain: {
      // Give a user friendly name to the specific contract you are signing for.
      name: "Fullcount",
      // Just let's you know the latest version. Definitely make sure the field name is correct.
      version: "1",
    },

    // Defining the message signing data content.
    message: {
      nonce,
      speed,
      vertical,
      horizontal,
    },
    // Refers to the keys of the *types* object below.
    primaryType: "FullcountPitchCommit",
    types: {
      // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
      // Refer to PrimaryType
      FullcountPitchCommit: [
        {
          type: "uint256",
          name: "nonce",
        },
        {
          type: "uint8",
          name: "speed",
        },
        {
          type: "uint8",
          name: "vertical",
        },
        {
          type: "uint8",
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

  // const retval = Buffer.from(
  //   JSON.stringify({
  //     address: account,
  //     deadline: JSON.parse(msgParams).message.deadline,
  //     signed_message: result,
  //   }),
  //   "utf-8",
  // ).toString("base64");

  return result;
}

export async function signSwing(
  account: string,
  provider: any,
  nonce: number,
  kind: number,
  vertical: number,
  horizontal: number,
): Promise<string> {
  // if (duration <= 0 || duration == undefined)
  //   throw new Error("signAccessToken: duration must be defined");
  if (!provider) throw new Error("signAccessToken: provider must be defined");
  if (!account) throw new Error("signAccessToken: account must be defined");

  const msgParams = JSON.stringify({
    domain: {
      // Give a user friendly name to the specific contract you are signing for.
      name: "Fullcount",
      // Just let's you know the latest version. Definitely make sure the field name is correct.
      version: "1",
    },

    // Defining the message signing data content.
    message: {
      nonce,
      kind,
      vertical,
      horizontal,
    },
    // Refers to the keys of the *types* object below.
    primaryType: "FullcountSwingCommit",
    types: {
      // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
      // Refer to PrimaryType
      FullcountSwingCommit: [
        {
          type: "uint256",
          name: "nonce",
        },
        {
          type: "uint8",
          name: "kind",
        },
        {
          type: "uint8",
          name: "vertical",
        },
        {
          type: "uint8",
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

  // const retval = Buffer.from(
  //   JSON.stringify({
  //     address: account,
  //     deadline: JSON.parse(msgParams).message.deadline,
  //     signed_message: result,
  //   }),
  //   "utf-8",
  // ).toString("base64");

  return result;
}
