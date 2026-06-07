import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { LOAN_PRODUCT, USER_ROLE } from "commonlib";
import ProductsService from "@root/api/products/ProductsService";
import { getPartnerIdsForUser } from "@root/utils/partnerAccessUtil";

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
  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const partnerIds = await getPartnerIdsForUser(context);

  const filter: Record<string, any> = {};
  if (partnerIds) {
    filter.PartnerID = { $in: partnerIds };
  }

  const items = await ProductsService.context(context).list({
    filter,
    sort: "ModifiedAt",
    sortOrder: "desc",
    page,
    pageSize,
  });

  const total = await ProductsService.context(context).count({ filter });

  return {
    items,
    total,
    page,
    pageSize,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: List,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
};
export default definition;
