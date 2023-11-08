export const queryCacheProps = {
  enabled: true,
  retryDelay: (attempt: number) => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
  refetchOnWindowFocus: false,
  staleTime: 50000,
  refetchOnMount: false,
  refetchOnReconnect: false,
  keepPreviousData: true,
  retry: (failureCount: number, error: any) => {
    const status = error?.response?.status;
    if (failureCount > 2) return false;
    return status === 404 || status === 403 ? false : true;
  },
};
export default queryCacheProps;

export interface ErrorAPI extends Error {
  request: any;
}
