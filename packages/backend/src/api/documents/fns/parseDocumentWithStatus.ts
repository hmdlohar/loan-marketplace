import { parseDocumentData, type ParseDocumentDataArgs } from "@root/api/documents/fns/parseDocumentData";

export type DocumentParseResult = {
  parsedData: Record<string, unknown>;
  parseStatus: "PARSED" | "FAILED";
  parseError?: string;
};

export type DocumentParseFields = {
  ParsedData: Record<string, unknown>;
  ParseStatus: "PARSED" | "FAILED";
  ParseError: string;
};

export function buildDocumentParseFields(result: DocumentParseResult): DocumentParseFields {
  if (result.parseStatus === "FAILED") {
    const parseError = result.parseError?.trim() || "Document parse failed.";
    return {
      ParsedData: { ...result.parsedData, parseError },
      ParseStatus: "FAILED",
      ParseError: parseError,
    };
  }

  return {
    ParsedData: result.parsedData,
    ParseStatus: "PARSED",
    ParseError: "",
  };
}

export async function parseDocumentWithStatus(args: ParseDocumentDataArgs): Promise<DocumentParseResult> {
  try {
    const parsedData = await parseDocumentData(args);
    return {
      parsedData,
      parseStatus: "PARSED",
    };
  } catch (ex: any) {
    const parseError = ex?.message || "Document parse failed.";
    return {
      parsedData: { parseError },
      parseStatus: "FAILED",
      parseError,
    };
  }
}
