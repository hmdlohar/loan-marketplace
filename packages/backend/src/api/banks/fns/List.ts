import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import BanksService from "@root/api/banks/BanksService";

const argsSchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  pageSize: yup.number().integer().min(1).max(100).default(20),
  search: yup.string().optional(),
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
  const filter: Record<string, any> = {};

  if (args.search?.trim()) {
    filter.Name = { $regex: args.search.trim(), $options: "i" };
  }

  const items = await BanksService.context(context).list({
    filter,
    sort: "Name",
    sortOrder: "asc",
    page,
    pageSize,
  });

  const total = await BanksService.context(context).count({ filter });

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
