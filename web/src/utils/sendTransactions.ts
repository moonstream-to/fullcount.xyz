import { SECOND_REVEAL_PRICE_MULTIPLIER } from "../constants";

export const sendTransactionWithEstimate = async (account: string, method: any) => {
  if (!account) {
    return new Promise((_, reject) => {
      reject(new Error(`Account address isn't set`));
    });
  }
  const estimatedGas = await method.estimateGas({ from: account });
  return method.send({
    from: account,
    gas: Math.ceil(SECOND_REVEAL_PRICE_MULTIPLIER * estimatedGas),
  });
};
