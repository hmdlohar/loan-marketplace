import { DOCUMENT_TYPE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";
import { getS3Object, guessContentType } from "@root/utils/s3Util";
import { parseDocumentWithStatus, buildDocumentParseFields } from "@root/api/documents/fns/parseDocumentWithStatus";
import { upsertCustomerProfileFromParsedData } from "@root/api/customers/fns/upsertProfileFromFormData";
import { ICMSContext } from "@root/types/cms";

export async function reparseDocument(args: {
  context: ICMSContext;
  documentId: string;
  force?: boolean;
}) {
  const document = await DocumentsService.context(args.context).get_Throwable(args.documentId);
  const docObj = typeof document.toObject === "function" ? document.toObject() : document;

  if (
    !args.context.IsAdmin &&
    docObj.Context?.UserID &&
    docObj.Context.UserID !== args.context.SystemUserID
  ) {
    throw new Error("You do not have access to this document.");
  }

  let parsedData = docObj.ParsedData as Record<string, unknown> | undefined;
  let parseStatus = docObj.ParseStatus || "PENDING";
  let parseError = docObj.ParseError as string | undefined;
  const shouldParse = args.force || !parsedData || Object.keys(parsedData).length === 0;

  if (shouldParse) {
    let parseFields;
    try {
      const s3Object = await getS3Object(docObj.Path);
      const body = s3Object.Body;
      if (!body) {
        throw new Error("Document file is missing from storage.");
      }
      const bytes = await body.transformToByteArray();
      const fileBuffer = Buffer.from(bytes);
      const contentType = s3Object.ContentType || guessContentType(docObj.Path);

      const parseResult = await parseDocumentWithStatus({
        documentType: docObj.DocumentType as DOCUMENT_TYPE,
        fileBuffer,
        contentType,
        fileName: docObj.Name,
      });
      parseFields = buildDocumentParseFields(parseResult);
    } catch (ex: any) {
      const message = ex?.message || "Document parse failed.";
      parseFields = buildDocumentParseFields({
        parsedData: {},
        parseStatus: "FAILED",
        parseError: message,
      });
    }

    parsedData = parseFields.ParsedData;
    parseStatus = parseFields.ParseStatus;
    parseError = parseFields.ParseError || undefined;

    await DocumentsService.context(args.context).update(args.documentId, parseFields);
  }

  const userId = docObj.Context?.UserID;
  if (
    userId &&
    parseStatus === "PARSED" &&
    (docObj.DocumentType === DOCUMENT_TYPE.PAN || docObj.DocumentType === DOCUMENT_TYPE.AADHAAR)
  ) {
    await upsertCustomerProfileFromParsedData(args.context, userId, parsedData || {});
  }

  return {
    ...docObj,
    ParsedData: parsedData,
    ParseStatus: parseStatus,
    ParseError: parseError,
  };
}
