import axios from "axios";

export const sendReport = async (title: string, content: string, tags: string[]): Promise<void> => {
  if (!process.env.NEXT_PUBLIC_HUMBUG_TOKEN) {
    console.log("humbug token isn't set");
    return;
  }

  try {
    await axios.post(
      "https://spire.bugout.dev/humbug/reports?sync=true",
      {
        title: title,
        content: `${info()} - ${content}`,
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

const info = () => {
  const currentDateTime = new Date();
  const usDateTimeFormat = currentDateTime.toLocaleString("en-US");
  return usDateTimeFormat;
};

const defaultTags = () => {
  return [`user_token: ${localStorage.getItem("FULLCOUNT_ACCESS_TOKEN") ?? ""}`];
};
