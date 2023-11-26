import { TOKEN_IMAGE_FALLBACK } from "../constants";

export function decodeBase64Json(encodedData: string) {
  try {
    // Split the encoded data to remove the data URI scheme if present
    const base64String = encodedData.split(",")[1] || encodedData;

    // Decode the base64 string to a UTF-8 string
    const decodedStr = Buffer.from(base64String, "base64").toString("utf-8");

    // Parse the JSON string to an object
    return JSON.parse(decodedStr);
  } catch (error) {
    console.error("Failed to decode base64 JSON data:", error);
    return null;
  }
}

export const getTokenMetadata = async (uri: string) => {
  const base64Encoded = decodeBase64Json(uri);
  if (base64Encoded) {
    return base64Encoded;
  }
  try {
    const response = await fetch(uri.slice(uri.indexOf("https://"))); //MULTICALL returns URL with a letter ('a', 'b') at the first position
    return await response.json();
  } catch {
    return { image: TOKEN_IMAGE_FALLBACK, name: "Unparsable" };
  }
};
