import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import ProductsService from "@root/api/products/ProductsService";
import BanksService from "@root/api/banks/BanksService";

const argsSchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  pageSize: yup.number().integer().min(1).max(100).default(20),
});
export type IListArgs = yup.InferType<typeof argsSchema>;

type IListReturnType = {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
};

export async function List(args: IListArgs, context: ICMSContext): Promise<IListReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const filter = { UserID: context.SystemUserID };

  const items = await ApplicationsService.context(context).list({
    filter,
    sort: "ModifiedAt",
    sortOrder: "desc",
    page,
    pageSize,
  });

  const total = await ApplicationsService.context(context).count({ filter });

  const enrichedItems = [];
  for (let i = 0; i < items.length; i++) {
    const application = items[i];
    const applicationObj = typeof application.toObject === "function" ? application.toObject() : application;
    let product = null;
    let bank = null;

    if (application.ProductID) {
      product = await ProductsService.context(context).findOne({ _id: application.ProductID });
      if (product && product.BankID) {
        bank = await BanksService.context(context).findOne({ _id: product.BankID });
      }
    }

    enrichedItems.push({
      ...application,
      Product: product
        ? {
            _id: product._id,
            Title: product.Title,
            Slug: product.Slug,
            LoanType: product.LoanType,
            ShortDescription: product.ShortDescription,
          }
        : null,
      Bank: bank
        ? {
            _id: bank._id,
            Name: bank.Name,
            LogoPath: bank.LogoPath,
          }
        : null,
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
  callback: List,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
