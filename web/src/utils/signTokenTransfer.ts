const domain = {
  name: "FullcountPlayerTransferAuthorization",
  version: "1",
};

export async function signTransferAuthorization(
  account: string,
  provider: any,
  tokenAddress: string,
  tokenId: string,
  deadline: number,
  playerId: string,
): Promise<string> {
  if (!provider) throw new Error("signTransferAuthorization: provider must be defined");
  if (!account) throw new Error("signTransferAuthorization: account must be defined");

  const msgParams = JSON.stringify({
    domain,
    message: {
      token_address: tokenAddress,
      token_id: tokenId,
      deadline,
      player_id: playerId,
    },
    primaryType: "TransferAuthorization",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
      ],
      TransferAuthorization: [
        { name: "token_address", type: "address" },
        { name: "token_id", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "player_id", type: "string" },
      ],
    },
  });

  return await provider.request({
    method: "eth_signTypedData_v4",
    params: [account, msgParams],
    from: account,
  });
}
