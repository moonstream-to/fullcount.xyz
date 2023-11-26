import { TOKEN_IMAGE_FALLBACK } from "../constants";
import { base } from "next/dist/build/webpack/config/blocks/base";

export function decodeBase64Json(encodedData: string): any {
  try {
    // Split the encoded data to remove the data URI scheme if present
    const base64String = encodedData.split(",")[1] || encodedData;

    // Decode the base64 string to a UTF-8 string
    const decodedStr = Buffer.from(base64String, "base64").toString("utf-8");

    // Parse the JSON string to an object
    return JSON.parse(decodedStr);
  } catch (error) {
    return null;
  }
}

export const getTokenMetadata = async (uri: string) => {
  const base64Encoded = decodeBase64Json(uri);
  if (base64Encoded && (base64Encoded.name || base64Encoded.image)) {
    return {
      ...base64Encoded,
      name: base64Encoded.name ?? "Unparsable",
      image: base64Encoded.image ?? TOKEN_IMAGE_FALLBACK,
    };
  }

  try {
    const response = await fetch(uri.slice(uri.indexOf("https://"))); //MULTICALL returns URL with a letter ('a', 'b') at the first position
    const fromUrl = await response.json();
    return {
      ...fromUrl,
      name: fromUrl.name ?? "Unparsable",
      image: fromUrl.image ?? TOKEN_IMAGE_FALLBACK,
    };
  } catch {
    return { image: TOKEN_IMAGE_FALLBACK, name: "Unparsable" };
  }
};
