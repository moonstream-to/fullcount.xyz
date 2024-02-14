import { MoonstreamWeb3ProviderInterface } from "../types/Moonstream";
import { OwnedToken } from "../types";

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
