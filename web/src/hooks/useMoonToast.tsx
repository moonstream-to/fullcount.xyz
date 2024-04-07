import { Box, Flex, useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import ErrorIcon from "../components/icons/ErrorIcon";

const useMoonToast = () => {
  const chakraToast = useToast();

  const toast = useCallback(
    (
      message: any,
      type: "info" | "warning" | "success" | "error" | "loading" | undefined,
      duration = 3000,
      title?: string,
    ) => {
      const colors = {
        info: "white",
        warning: "white",
        success: "white",
        error: "#262019",
        loading: "white",
      };
      const bgColors = {
        info: "#7E8E7F",
        warning: "#7E8E7F",
        success: "#7E8E7F",
        error: "#d99c9c",
        loading: "#7E8E7F",
      };
      const userTitle = title ?? message?.response?.statusText ?? type;

      const userMessage =
        message?.response?.data?.detail ?? typeof message === "string"
          ? message
          : userTitle === type
          ? ""
          : type;
      const id = `${userTitle}-${userMessage}-${type}`;
      if (!chakraToast.isActive(id)) {
        chakraToast({
          id: id,
          position: "top",
          duration,
          render: () => (
            <Flex
              border="1px solid #262019"
              textAlign="center"
              color={type ? colors[type] : "white"}
              backgroundColor={type ? bgColors[type] : "white"}
              padding="10px"
              gap="10px"
              fontSize={"14px"}
              width={"300px"}
            >
              {type === "error" && <ErrorIcon />}
              {message}
            </Flex>
          ),
        });
      }
    },
    [chakraToast],
  );

  return toast;
};

export default useMoonToast;
