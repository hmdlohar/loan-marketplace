export type DocumentParseStatus = "PENDING" | "PARSED" | "FAILED";

export function getDocumentParseStatus(parsedData: Record<string, unknown> | null | undefined): DocumentParseStatus {
  if (!parsedData || typeof parsedData !== "object") {
    return "PENDING";
  }

  const parseError = parsedData.parseError;
  if (parseError !== undefined && parseError !== null && String(parseError).trim() !== "") {
    return "FAILED";
  }

  const keys = Object.keys(parsedData).filter((key) => key !== "parseError");
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = parsedData[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return "PARSED";
    }
  }

  return "PENDING";
}
