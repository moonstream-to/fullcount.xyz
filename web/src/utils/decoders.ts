export function decodeBase64Json(encodedData: string): any {
  try {
    // Split the encoded data to remove the data URI scheme if present
    const base64String = encodedData.split(",")[1] || encodedData;

    // Decode the base64 string to a UTF-8 string
    const decodedStr = Buffer.from(base64String, "base64").toString("utf-8");

    // Parse the JSON string to an object
    return JSON.parse(decodedStr);
  } catch (error) {
    return { image: "", name: "Unparsable" };
  }
}
