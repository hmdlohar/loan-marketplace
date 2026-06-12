import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { DOCUMENT_TYPE, USER_ROLE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import { getFileProxyUrl } from "@root/utils/s3Util";

const argsSchema = yup.object({
  ApplicationID: yup.string().required(),
  DocumentID: yup.string().required(),
});
export type IAttachToApplicationArgs = yup.InferType<typeof argsSchema>;

type IAttachToApplicationReturnType = any;

export async function AttachToApplication(
  args: IAttachToApplicationArgs,
  context: ICMSContext
): Promise<IAttachToApplicationReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const application = await ApplicationsService.context(context).get_Throwable(args.ApplicationID);
  if (application.UserID !== context.SystemUserID) {
    throw new Error("You do not have access to this application.");
  }

  const document = await DocumentsService.context(context).get_Throwable(args.DocumentID);
  const docObj = document.toObject ? document.toObject() : document;

  if (docObj.Context?.UserID && docObj.Context.UserID !== context.SystemUserID) {
    throw new Error("You do not have access to this document.");
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
  documentIds[docObj.DocumentType as keyof typeof documentIds] = docObj._id;

  await ApplicationsService.context(context).update(args.ApplicationID, {
    DocumentIDs: documentIds,
  });

  return {
    ...docObj,
    FileUrl: docObj.Path ? getFileProxyUrl(docObj.Path) : "",
  };
}

const definition: IRPCFunctionDefinition = {
  callback: AttachToApplication,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
