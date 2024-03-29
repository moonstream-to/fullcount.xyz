import { useMutation } from "react-query";
import useMoonToast from "./useMoonToast";
import useUser from "../contexts/UserContext";
import { registerService } from "../services/auth.service";
import { sendReport } from "../utils/humbug";

const useSignUp = () => {
  const { getUser } = useUser();
  const toast = useMoonToast();

  const {
    mutate: signUp,
    isLoading,
    error,
    data,
    isSuccess,
  } = useMutation(registerService(), {
    onSuccess: (response, variables) => {
      localStorage.setItem("FULLCOUNT_ACCESS_TOKEN", response.data.id);
      localStorage.setItem("FULLCOUNT_USER_ID", response.data.user_id);
      sendReport("signed up", `${variables.username} - ${variables.email}`, [
        `user_token: ${response.data.id}`,
      ]);

      getUser();
    },
    onError: (error: any, variables) => {
      console.log(error);
      let message = error.response?.data?.detail ?? error.message;
      sendReport("Error signing up", `${variables.username} - ${variables.email} - ${message}`, [
        "type:error",
        "error_domain:account",
        `error:account-signup`,
        `user:${variables.username}`,
      ]);

      if (error.response?.status === 409) {
        message = "username or email already exists";
      }
      toast(message, "error", 5000);
    },
  });

  return {
    signUp,
    isLoading,
    data,
    error,
    isSuccess,
  };
};

export default useSignUp;
