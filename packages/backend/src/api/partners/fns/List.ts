import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import PartnersService from "@root/api/partners/PartnersService";

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

  const items = await PartnersService.context(context).list({
    sort: "CreatedAt",
    sortOrder: "desc",
    page,
    pageSize,
  });

  const total = await PartnersService.context(context).count({});

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
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
