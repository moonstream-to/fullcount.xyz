import { useMutation } from "react-query";
import useUser from "../contexts/UserContext";
import { loginService } from "../services/auth.service";
import useMoonToast from "./useMoonToast";

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
    onSuccess: (data: any) => {
      if (!data) {
        return;
      }
      localStorage.setItem("FULLCOUNT_ACCESS_TOKEN", data.data.id);
      getUser(data.data.user_id);
    },
    onError: (error: any) => {
      console.log(error);
      const message = error.response?.data?.detail ?? error.message;
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
