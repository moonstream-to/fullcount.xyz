const LOCAL_STORAGE_NAMESPACE = "fullcount.xyz";

export const getLocalStorageKey = (
  contractAddress: string,
  selectedSession: any,
  selectedToken: any,
) =>
  `${LOCAL_STORAGE_NAMESPACE}-${contractAddress}-${selectedSession?.sessionID}-${selectedToken?.id}`;

export const getLocalStorageInviteCodeKey = (contractAddress: string, sessionID: string) =>
  `${LOCAL_STORAGE_NAMESPACE}-invites-${contractAddress}-${sessionID}`;

export const getAppStorageItem = (key: string, isSessionStorage = false) => {
  const item = isSessionStorage
    ? sessionStorage.getItem(key) ?? ""
    : localStorage.getItem(key) ?? "";
  return item ? JSON.parse(item) : null;
};

export const setAppStorageItem = (key: string, value: any, isSessionStorage = false) =>
  isSessionStorage
    ? sessionStorage.setItem(key, JSON.stringify(value))
    : localStorage.setItem(key, JSON.stringify(value));
