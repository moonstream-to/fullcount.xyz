// pitchMutations.ts
import { MutationFunction, UseMutationResult, useMutation, MutateFunction } from "react-query";
import { sendTransactionWithEstimate } from "../utils/sendTransactions";

const MESSAGE_ERROR_ACCOUNT_NOT_SET = "Account address isn't set";

interface Signature {
  sign: string;
}

interface RevealDetails {
  nonce: string;
  speed: number;
  vertical: number;
  horizontal: number;
}

export function useCommitPitch(
  gameContract: any,
  selectedSession: any,
  web3ctx: any,
  onSuccessCallbacks: any,
  onErrorCallback: any,
): UseMutationResult<any, Error, Signature, unknown> {
  const mutationFn: MutationFunction<any, Signature> = async ({ sign }: Signature) => {
    if (!web3ctx.account) {
      return new Promise((_, reject) => {
        reject(new Error(MESSAGE_ERROR_ACCOUNT_NOT_SET));
      });
    }
    return sendTransactionWithEstimate(
      web3ctx.account,
      gameContract.methods.commitPitch(selectedSession?.sessionID, sign),
    );
  };

  return useMutation(mutationFn, {
    onSuccess: onSuccessCallbacks,
    onError: onErrorCallback,
  });
}

export function useRevealPitch(
  gameContract: any,
  selectedSession: any,
  web3ctx: any,
  onSuccessCallbacks: any,
  onErrorCallback: any,
): UseMutationResult<any, Error, RevealDetails, unknown> {
  const mutationFn: MutateFunction<any, any, RevealDetails, unknown> = async ({
    nonce,
    speed,
    vertical,
    horizontal,
  }: RevealDetails) => {
    if (!web3ctx.account) {
      return new Promise((_, reject) => {
        reject(new Error(MESSAGE_ERROR_ACCOUNT_NOT_SET));
      });
    }
    return sendTransactionWithEstimate(
      web3ctx.account,
      gameContract.methods.revealPitch(
        selectedSession?.sessionID,
        nonce,
        speed,
        vertical,
        horizontal,
      ),
    );
  };

  return useMutation(mutationFn, {
    onSuccess: onSuccessCallbacks,
    onError: onErrorCallback,
  });
}
