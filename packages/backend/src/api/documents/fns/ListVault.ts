import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { DOCUMENT_TYPE, USER_ROLE } from "commonlib";
import DocumentsService from "@root/api/documents/DocumentsService";
import { getFileProxyUrl } from "@root/utils/s3Util";

const argsSchema = yup.object({});
export type IListVaultArgs = yup.InferType<typeof argsSchema>;

type IListVaultReturnType = {
  items: Record<string, any[]>;
};

function hasUsableParsedData(docObj: Record<string, any>) {
  if (docObj.ParseStatus !== "PARSED") {
    return false;
  }
  const parsedData = docObj.ParsedData;
  if (!parsedData || typeof parsedData !== "object") {
    return false;
  }
  const keys = Object.keys(parsedData).filter((key) => key !== "parseError");
  for (let i = 0; i < keys.length; i++) {
    const value = parsedData[keys[i]];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return true;
    }
  }
  return false;
}

export async function ListVault(args: IListVaultArgs, context: ICMSContext): Promise<IListVaultReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const userId = context.SystemUserID;
  const items = await DocumentsService.context(context).list({
    filter: {
      "Context.UserID": userId,
    },
    sort: "ModifiedAt",
    sortOrder: "desc",
    page: 1,
    pageSize: 200,
  });

  const byType: Record<string, any[]> = {};
  for (let i = 0; i < items.length; i++) {
    const doc = items[i];
    const docObj = doc.toObject ? doc.toObject() : doc;
    if (!hasUsableParsedData(docObj)) {
      continue;
    }
    const docType = docObj.DocumentType as DOCUMENT_TYPE;
    if (!byType[docType]) {
      byType[docType] = [];
    }
    byType[docType].push({
      ...docObj,
      FileUrl: docObj.Path ? getFileProxyUrl(docObj.Path) : "",
    });
  }

  return { items: byType };
}

const definition: IRPCFunctionDefinition = {
  callback: ListVault,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
