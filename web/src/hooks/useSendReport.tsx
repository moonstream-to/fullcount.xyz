import axios from "axios";
import { HUMBUG_REPORT_VERSION } from "../constants";
import useUser from "../contexts/UserContext";
import { useGameContext } from "../contexts/GameContext";

// Helper function to format content
const info = (content: object) => {
  const now = new Date();
  const UTC = now.toUTCString();
  try {
    return JSON.stringify({ ...content, UTC });
  } catch (error) {
    return JSON.stringify({ UTC, internalError: "can't stringify content", error });
  }
};

export const useSendReport = () => {
  const { user } = useUser();
  const { userSessionId } = useGameContext();

  const sendReport = async (title: string, content: object, tags: string[]) => {
    if (!process.env.NEXT_PUBLIC_HUMBUG_TOKEN) {
      console.log("Humbug token isn't set");
      return;
    }

    try {
      const data = {
        title: title,
        content: info(content),
        tags: [
          ...tags,
          `client_id:${user?.user_id ?? "undefined"}`,
          `user_session_id:${userSessionId}`,
          `report_version:${HUMBUG_REPORT_VERSION}`,
        ],
      };
      console.log("Sending data:", data);

      await axios.post("https://spire.bugout.dev/humbug/reports?sync=true", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUMBUG_TOKEN}`,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("HUMBUG Axios error:", error.message);
      } else {
        console.error("HUMBUG Unexpected error:", error);
      }
    }
  };

  return { sendReport };
};
