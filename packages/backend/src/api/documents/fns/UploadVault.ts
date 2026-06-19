import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { DOCUMENT_TYPE, USER_ROLE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";
import CustomersService from "@root/api/customers/CustomersService";
import { uploadCustomerVaultDocument, guessContentType } from "@root/utils/s3Util";
import { parseDocumentData } from "@root/api/documents/fns/parseDocumentData";
import { upsertCustomerProfileFromParsedData } from "@root/api/customers/fns/upsertProfileFromFormData";

const argsSchema = yup.object({
  DocumentType: yup.string().oneOf(Object.values(DOCUMENT_TYPE)).required(),
  Name: yup.string().required(),
  FileBase64: yup.string().required(),
  ContentType: yup.string().optional(),
});
export type IUploadVaultArgs = yup.InferType<typeof argsSchema>;

type IUploadVaultReturnType = any;

export async function UploadVault(args: IUploadVaultArgs, context: ICMSContext): Promise<IUploadVaultReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const userId = context.SystemUserID;
  const base64Data = args.FileBase64.includes(",") ? args.FileBase64.split(",")[1] : args.FileBase64;
  const buffer = Buffer.from(base64Data, "base64");
  const contentType = args.ContentType || guessContentType(args.Name);

  const uploaded = await uploadCustomerVaultDocument(
    userId,
    args.DocumentType,
    buffer,
    contentType,
    args.Name
  );

  const customer = await CustomersService.context(context).findOne({ UserID: userId });
  const documentType = args.DocumentType as DOCUMENT_TYPE;
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
    },
  });

  if (documentType === DOCUMENT_TYPE.PAN || documentType === DOCUMENT_TYPE.AADHAAR) {
    await upsertCustomerProfileFromParsedData(context, userId, parsedData);
  }

  return {
    ...(document.toObject ? document.toObject() : document),
    FileUrl: uploaded.fileUrl,
    ParsedData: parsedData,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: UploadVault,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
