import { OwnedToken } from "../types";
import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
import { sendTransactionWithEstimate } from "../utils/sendTransactions";

export async function fetchFullcountPlayerTokens() {
  console.log(`${fetchFullcountPlayerTokens.name} is not implemented`);
  return [];
}

export async function startSessionFullcountPlayer({
  token,
  role,
  requireSignature,
}: {
  token: OwnedToken;
  role: number;
  requireSignature: boolean;
}): Promise<{ sessionID: string; sign: string | undefined }> {
  return Promise.reject(new Error(`${startSessionFullcountPlayer.name} is not implemented`));
}

export function joinSessionFullcountPlayer({
  token,
  sessionID,
  inviteCode,
}: {
  token: OwnedToken;
  sessionID: number;
  inviteCode: string | undefined;
}): Promise<unknown> {
  return Promise.reject(new Error(`${joinSessionFullcountPlayer.name} is not implemented`));
}

export function commitSwingFullcountPlayer({
  sign,
  sessionID,
}: {
  sign: string;
  sessionID: number;
}) {
  return Promise.reject(new Error(`${commitSwingFullcountPlayer.name} is not implemented`));
}

export const revealSwingFullcountPlayer = ({
  nonce,
  sessionID,
  actionChoice,
  vertical,
  horizontal,
}: {
  nonce: string;
  actionChoice: number;
  vertical: number;
  horizontal: number;
  sessionID: number;
}) => {
  return Promise.reject(new Error(`${revealSwingFullcountPlayer.name} is not implemented`));
};

export const commitPitchFullcountPlayer = ({
  sign,
  sessionID,
}: {
  sign: string;
  sessionID: number;
}) => {
  return Promise.reject(new Error(`${commitPitchFullcountPlayer.name} is not implemented`));
};

export const revealPitchFullcountPlayer = ({
  nonce,
  sessionID,
  actionChoice,
  vertical,
  horizontal,
}: {
  nonce: string;
  actionChoice: number;
  vertical: number;
  horizontal: number;
  sessionID: number;
}) => {
  return Promise.reject(new Error(`${revealPitchFullcountPlayer.name} is not implemented`));
};
