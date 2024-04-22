import axios from "axios";
import { HUMBUG_REPORT_VERSION } from "../constants";

export const sendReport = async (title: string, content: object, tags: string[]): Promise<void> => {
  if (!process.env.NEXT_PUBLIC_HUMBUG_TOKEN) {
    console.log("humbug token isn't set");
    return;
  }
  try {
    await axios.post(
      "https://spire.bugout.dev/humbug/reports?sync=true",
      {
        title: title,
        content: info(content),
        tags: [...tags, ...defaultTags()],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUMBUG_TOKEN}`,
        },
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("HUMBUG Axios error:", error.message);
    } else {
      console.error("HUMBUG Unexpected error:", error);
    }
  }
};

const info = (content: object) => {
  const now = new Date();
  const UTC = now.toUTCString();
  try {
    if (content) {
      return JSON.stringify({ ...content, UTC });
    }
    return JSON.stringify({ UTC });
  } catch (error) {
    return JSON.stringify({ UTC, internalError: "can't stringify content", error });
  }
};

const defaultTags = () => {
  return [
    `client_id:${localStorage.getItem("FULLCOUNT_USER_ID") ?? ""}`,
    `user_session_id:${localStorage.getItem("FULLCOUNT_USER_SESSION_ID") ?? ""}`,
    `report_version:${HUMBUG_REPORT_VERSION}`,
  ];
};
