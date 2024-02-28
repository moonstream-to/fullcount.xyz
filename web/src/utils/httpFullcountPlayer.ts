// import enableMockupRequests from "./mockupRequests"
import axios from "axios";

// process.env.NODE_ENV !== "production" && enableMockupRequests(axios)

const http = (config: any) => {
  const token = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
  const authorization = token ? { Authorization: `Bearer ${token}` } : {};
  const defaultHeaders = config.headers ?? {};
  const options = {
    ...config,
    headers: {
      ...defaultHeaders,
      ...authorization,
    },
  };

  return axios(options);
};

export { axios };
export default http;
