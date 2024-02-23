export async function signWeb3AuthorizationMessage(
  provider: any,
  account: string,
): Promise<string> {
  const msgParams = JSON.stringify({
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
      Web3Authorization: [
        { name: "address", type: "address" },
        { name: "deadline", type: "uint256" },
        { name: "application", type: "string" },
      ],
    },
    primaryType: "Web3Authorization",
    domain: { name: "Web3Authorization", version: "1" },
    message: {
      name: "Web3Authorization",
      version: "1",
      address: account,
      deadline: 1708523541,
      application: "FullcountPlayer",
    },
  });

  const signature = await provider.request({
    method: "eth_signTypedData_v4",
    params: [account, msgParams],
    from: account,
  });

  return signature;
}
