import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { DOCUMENT_TYPE, USER_ROLE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import { uploadApplicationDocument, guessContentType } from "@root/utils/s3Util";

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

  const base64Data = args.FileBase64.includes(",") ? args.FileBase64.split(",")[1] : args.FileBase64;
  const buffer = Buffer.from(base64Data, "base64");
  const contentType = args.ContentType || guessContentType(args.Name);

  const uploaded = await uploadApplicationDocument(
    args.ApplicationID,
    args.DocumentType,
    buffer,
    contentType,
    args.Name
  );

  const document = await DocumentsService.context(context).create({
    Name: args.Name,
    Path: uploaded.key,
    DocumentType: args.DocumentType as DOCUMENT_TYPE,
    Context: {
      ApplicationID: args.ApplicationID,
      UserID: context.SystemUserID,
      ProductID: application.ProductID,
      CustomerID: application.CustomerID,
    },
  });

  const documentIds = { ...(application.DocumentIDs || {}) };
  documentIds[args.DocumentType as keyof typeof documentIds] = document._id;

  await ApplicationsService.context(context).update(args.ApplicationID, {
    DocumentIDs: documentIds,
    Status: application.Status,
  });

  return {
    ...document.toObject(),
    FileUrl: uploaded.fileUrl,
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
