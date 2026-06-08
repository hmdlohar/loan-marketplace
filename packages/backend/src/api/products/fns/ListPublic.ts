import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { LOAN_PRODUCT, USER_ROLE } from "commonlib";
import ProductsService from "@root/api/products/ProductsService";
import BanksService from "@root/api/banks/BanksService";

const argsSchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  pageSize: yup.number().integer().min(1).max(100).default(20),
  loanType: yup.string().oneOf(Object.values(LOAN_PRODUCT)).optional(),
  search: yup.string().optional(),
});
export type IListPublicArgs = yup.InferType<typeof argsSchema>;

type IListPublicReturnType = {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
};

export async function ListPublic(args: IListPublicArgs, context: ICMSContext): Promise<IListPublicReturnType> {
  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const filter: Record<string, any> = {};

  if (args.loanType) {
    filter.LoanType = args.loanType;
  }

  const items = await ProductsService.context(context).list({
    filter,
    sort: "ModifiedAt",
    sortOrder: "desc",
    page,
    pageSize,
    search: args.search,
  });

  const total = await ProductsService.context(context).count({ filter });

  const enrichedItems = [];
  for (let i = 0; i < items.length; i++) {
    const product = items[i];
    const productObj = typeof product.toObject === "function" ? product.toObject() : product;
    let bank = null;
    if (productObj.BankID) {
      const bankDoc = await BanksService.context(context).findOne({ _id: productObj.BankID });
      if (bankDoc) {
        const bankObj = typeof bankDoc.toObject === "function" ? bankDoc.toObject() : bankDoc;
        bank = {
          _id: bankObj._id,
          Name: bankObj.Name,
          LogoPath: bankObj.LogoPath,
        };
      }
    }
    enrichedItems.push({
      ...productObj,
      Bank: bank,
    });
  }

  return {
    items: enrichedItems,
    total,
    page,
    pageSize,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: ListPublic,
  argsSchema,
  access: {
    allow: [USER_ROLE.PUBLIC],
  },
};
export default definition;
