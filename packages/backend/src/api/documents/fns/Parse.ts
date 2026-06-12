import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { DOCUMENT_TYPE, USER_ROLE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";
import { buildDummyParsedData } from "@root/utils/documentParseUtil";
import { upsertCustomerProfileFromParsedData } from "@root/utils/customerProfileUtil";

const argsSchema = yup.object({
  DocumentID: yup.string().required(),
});
export type IParseArgs = yup.InferType<typeof argsSchema>;

type IParseReturnType = any;

export async function Parse(args: IParseArgs, context: ICMSContext): Promise<IParseReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const document = await DocumentsService.context(context).get_Throwable(args.DocumentID);
  const docObj = document.toObject ? document.toObject() : document;

  if (docObj.Context?.UserID && docObj.Context.UserID !== context.SystemUserID) {
    throw new Error("You do not have access to this document.");
  }

  let parsedData = docObj.ParsedData;
  if (!parsedData || Object.keys(parsedData).length === 0) {
    parsedData = buildDummyParsedData(docObj.DocumentType as DOCUMENT_TYPE);
    await DocumentsService.context(context).update(args.DocumentID, { ParsedData: parsedData });
  }

  if (docObj.DocumentType === DOCUMENT_TYPE.PAN || docObj.DocumentType === DOCUMENT_TYPE.AADHAAR) {
    await upsertCustomerProfileFromParsedData(context, context.SystemUserID, parsedData);
  }

  return {
    ...docObj,
    ParsedData: parsedData,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: Parse,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
