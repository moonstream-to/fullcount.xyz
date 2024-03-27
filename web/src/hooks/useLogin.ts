import { useMutation } from "react-query";
import useUser from "../contexts/UserContext";
import { loginService } from "../services/auth.service";
import useMoonToast from "./useMoonToast";
import { sendReport } from "../utils/humbug";

const useLogin = () => {
  const { getUser } = useUser();
  const toast = useMoonToast();
  const {
    mutate: login,
    isLoading,
    isSuccess,
    error,
    data,
  } = useMutation(loginService, {
    onSuccess: (data: any, variables) => {
      if (!data) {
        return;
      }
      localStorage.setItem("FULLCOUNT_ACCESS_TOKEN", data.data.id);
      localStorage.setItem("FULLCOUNT_USER_ID", data.data.user_id);
      sendReport("logged in", variables.username, [`user_token: ${data.data.id}`]);
      getUser(data.data.user_id);
    },
    onError: (error: any, variables) => {
      console.log(error);
      const message = error.response?.data?.detail ?? error.message;
      sendReport("Error logging in", `${variables.username} - ${message}`, []);
      toast(message, "error");
    },
  });

  return {
    login,
    isLoading,
    isSuccess,
    data,
    error,
  };
};

export default useLogin;
