export const mutationOptions = {
  retryDelay: (attemptIndex: number) => (attemptIndex < 1 ? 5000 : 10000),
  retry: (failureCount: number, error: unknown) => {
    console.log(error);
    if (failureCount < 3) {
      console.log("Will retry in 5, maybe 10 seconds");
    }
    return failureCount < 3;
  },
};
