import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import ProductsService from "@root/api/products/ProductsService";
import BanksService from "@root/api/banks/BanksService";
import CustomersService from "@root/api/customers/CustomersService";
import DocumentsService from "@root/api/documents/DocumentsService";
import { assertReviewAccess } from "./assertReviewAccess";

const argsSchema = yup.object({
  _id: yup.string().required(),
});
export type IGetForReviewArgs = yup.InferType<typeof argsSchema>;

type IGetForReviewReturnType = any;

export async function GetForReview(args: IGetForReviewArgs, context: ICMSContext): Promise<IGetForReviewReturnType> {
  const application = await ApplicationsService.context(context).get_Throwable(args._id);
  const applicationObj = application.toObject ? application.toObject() : application;

  await assertReviewAccess(context, applicationObj);

  let product = null;
  let bank = null;
  if (applicationObj.ProductID) {
    const productDoc = await ProductsService.context(context).findOne({ _id: applicationObj.ProductID });
    if (productDoc) {
      product = productDoc.toObject ? productDoc.toObject() : productDoc;
      if (product.BankID) {
        const bankDoc = await BanksService.context(context).findOne({ _id: product.BankID });
        if (bankDoc) {
          const bankObj = bankDoc.toObject ? bankDoc.toObject() : bankDoc;
          bank = { _id: bankObj._id, Name: bankObj.Name, LogoPath: bankObj.LogoPath };
        }
      }
    }
  }

  let customer = null;
  if (applicationObj.CustomerID) {
    const customerDoc = await CustomersService.context(context).findOne({ _id: applicationObj.CustomerID });
    if (customerDoc) {
      customer = customerDoc.toObject ? customerDoc.toObject() : customerDoc;
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
    const docId = documentIdEntries[i][1];
    if (!docId) {
      continue;
    }
    const document = await DocumentsService.context(context).findOne({ _id: docId });
    if (document) {
      documents.push(document.toObject ? document.toObject() : document);
    }
  }

  return {
    ...applicationObj,
    Product: product,
    Bank: bank,
    Customer: customer,
    Documents: documents,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: GetForReview,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
};
export default definition;
