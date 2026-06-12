import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import ProductsService from "@root/api/products/ProductsService";
import BanksService from "@root/api/banks/BanksService";
import DocumentsService from "@root/api/documents/DocumentsService";

const argsSchema = yup.object({
  _id: yup.string().required(),
});
export type IGetArgs = yup.InferType<typeof argsSchema>;

type IGetReturnType = any;

export async function Get(args: IGetArgs, context: ICMSContext): Promise<IGetReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const application = await ApplicationsService.context(context).get_Throwable(args._id);
  if (application.UserID !== context.SystemUserID) {
    throw new Error("You do not have access to this application.");
  }

  const applicationObj = application.toObject ? application.toObject() : application;
  let product = null;
  let bank = null;

  if (applicationObj.ProductID) {
    product = await ProductsService.context(context).findOne({ _id: applicationObj.ProductID });
    if (product) {
      const productObj = product.toObject ? product.toObject() : product;
      product = productObj;
      if (productObj.BankID) {
        bank = await BanksService.context(context).findOne({ _id: productObj.BankID });
      }
    }
  }

  const rawDocumentIds = applicationObj.DocumentIDs || {};
  const documentIdEntries = [
    ["PAN", rawDocumentIds.PAN],
    ["AADHAAR", rawDocumentIds.AADHAAR],
    ["SALARY_SLIP", rawDocumentIds.SALARY_SLIP],
    ["BANK_STATEMENT", rawDocumentIds.BANK_STATEMENT],
    ["ITR", rawDocumentIds.ITR],
    ["GST_RETURN", rawDocumentIds.GST_RETURN],
    ["PROPERTY_DOCUMENT", rawDocumentIds.PROPERTY_DOCUMENT],
  ] as const;
  const documents = [];
  for (let i = 0; i < documentIdEntries.length; i++) {
    const docType = documentIdEntries[i][0];
    const docId = documentIdEntries[i][1];
    if (!docId) {
      continue;
    }
    const document = await DocumentsService.context(context).findOne({ _id: docId });
    if (document) {
      const documentObj = document.toObject ? document.toObject() : document;
      documents.push(documentObj);
    }
  }

  return {
    ...applicationObj,
    Product: product,
    Bank: bank
      ? {
          _id: bank._id,
          Name: bank.Name,
          LogoPath: bank.LogoPath,
        }
      : null,
    Documents: documents,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: Get,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
