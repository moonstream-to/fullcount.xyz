const LOCAL_STORAGE_NAMESPACE = "fullcount.xyz";

export const getLocalStorageKey = (
  contractAddress: string,
  selectedSession: any,
  selectedToken: any,
) =>
  `${LOCAL_STORAGE_NAMESPACE}-${contractAddress}-${selectedSession?.sessionID}-${selectedToken?.id}`;

export const getLocalStorageInviteCodeKey = (contractAddress: string, sessionID: string) =>
  `${LOCAL_STORAGE_NAMESPACE}-invites-${contractAddress}-${sessionID}`;

export const getLocalStorageItem = (key: string) => {
  const item = localStorage.getItem(key) ?? "";
  return item ? JSON.parse(item) : null;
};

export const setLocalStorageItem = (key: string, value: any) =>
  localStorage.setItem(key, JSON.stringify(value));
