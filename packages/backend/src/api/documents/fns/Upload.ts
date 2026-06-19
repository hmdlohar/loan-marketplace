import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { DOCUMENT_TYPE, USER_ROLE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import CustomersService from "@root/api/customers/CustomersService";
import { uploadCustomerVaultDocument, guessContentType } from "@root/utils/s3Util";
import { parseDocumentData } from "@root/api/documents/fns/parseDocumentData";
import { upsertCustomerProfileFromParsedData } from "@root/api/customers/fns/upsertProfileFromFormData";
import { getFileProxyUrl } from "@root/utils/s3Util";

const argsSchema = yup.object({
  ApplicationID: yup.string().required(),
  DocumentType: yup.string().oneOf(Object.values(DOCUMENT_TYPE)).required(),
  Name: yup.string().required(),
  FileBase64: yup.string().required(),
  ContentType: yup.string().optional(),
});
export type IUploadArgs = yup.InferType<typeof argsSchema>;

type IUploadReturnType = any;

export async function Upload(args: IUploadArgs, context: ICMSContext): Promise<IUploadReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const application = await ApplicationsService.context(context).get_Throwable(args.ApplicationID);
  if (application.UserID !== context.SystemUserID) {
    throw new Error("You do not have access to this application.");
  }

  const userId = context.SystemUserID;
  const base64Data = args.FileBase64.includes(",") ? args.FileBase64.split(",")[1] : args.FileBase64;
  const buffer = Buffer.from(base64Data, "base64");
  const contentType = args.ContentType || guessContentType(args.Name);
  const documentType = args.DocumentType as DOCUMENT_TYPE;

  const uploaded = await uploadCustomerVaultDocument(
    userId,
    args.DocumentType,
    buffer,
    contentType,
    args.Name
  );

  const customer = await CustomersService.context(context).findOne({ UserID: userId });
  const parsedData = await parseDocumentData({
    documentType,
    fileBuffer: buffer,
    contentType,
    fileName: args.Name,
  });

  const document = await DocumentsService.context(context).create({
    Name: args.Name,
    Path: uploaded.key,
    DocumentType: documentType,
    ParsedData: parsedData,
    Context: {
      UserID: userId,
      CustomerID: customer?._id,
      ApplicationID: args.ApplicationID,
      ProductID: application.ProductID,
    },
  });

  if (documentType === DOCUMENT_TYPE.PAN || documentType === DOCUMENT_TYPE.AADHAAR) {
    await upsertCustomerProfileFromParsedData(context, userId, parsedData);
  }

  const applicationObj = application.toObject ? application.toObject() : application;
  const existingDocIds = applicationObj.DocumentIDs || {};
  const documentIds = {
    PAN: existingDocIds.PAN,
    AADHAAR: existingDocIds.AADHAAR,
    SALARY_SLIP: existingDocIds.SALARY_SLIP,
    BANK_STATEMENT: existingDocIds.BANK_STATEMENT,
    ITR: existingDocIds.ITR,
    GST_RETURN: existingDocIds.GST_RETURN,
    PROPERTY_DOCUMENT: existingDocIds.PROPERTY_DOCUMENT,
  };
  documentIds[documentType as keyof typeof documentIds] = document._id;

  await ApplicationsService.context(context).update(args.ApplicationID, {
    DocumentIDs: documentIds,
  });

  return {
    ...(document.toObject ? document.toObject() : document),
    FileUrl: getFileProxyUrl(uploaded.key),
    ParsedData: parsedData,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: Upload,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
