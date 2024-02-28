import { useMutation } from "react-query";
import useMoonToast from "./useMoonToast";
import useUser from "../contexts/UserContext";
import { registerService } from "../services/auth.service";

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
    onSuccess: (response) => {
      localStorage.setItem("FULLCOUNT_ACCESS_TOKEN", response.data.id);
      getUser();
    },
    onError: (error: any) => {
      console.log(error);
      let message = error.response.data?.detail ?? error.message;
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
