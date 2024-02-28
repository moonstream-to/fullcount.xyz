import { useEffect } from "react";
import { useMutation } from "react-query";
import useAuthResultHandler from "./useAuthHandler";
import { forgotPasswordService } from "../services/auth.service";
import { useToast } from "@chakra-ui/react";

interface ErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const useForgotPassword = () => {
  const toast = useToast();
  const { mutate: forgotPassword, isLoading, error, data } = useMutation(forgotPasswordService);
  useAuthResultHandler(data, error, "Please check your inbox for verification URL.", "Error");

  useEffect(() => {
    if ((error as ErrorResponse)?.response?.data?.detail) {
      toast({
        title: "Error",
        description: (error as ErrorResponse)?.response?.data?.detail ?? "Unknown error",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      toast();
    }
  }, [error, toast, data]);

  return { forgotPassword, isLoading, data };
};

export default useForgotPassword;
