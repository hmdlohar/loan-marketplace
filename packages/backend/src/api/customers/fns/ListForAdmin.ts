import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import CustomersService from "@root/api/customers/CustomersService";

const argsSchema = yup.object({
  search: yup.string().optional(),
  pageSize: yup.number().integer().min(1).max(100).default(50),
});
export type IListForAdminArgs = yup.InferType<typeof argsSchema>;

type CustomerFilterOption = {
  _id: string;
  label: string;
};

type IListForAdminReturnType = {
  items: CustomerFilterOption[];
};

export async function ListForAdmin(args: IListForAdminArgs, context: ICMSContext): Promise<IListForAdminReturnType> {
  const search = args.search?.trim();
  const pageSize = args.pageSize || 50;
  const filter: Record<string, any> = {};

  if (search) {
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ FullName: pattern }, { Mobile: pattern }, { FirstName: pattern }, { LastName: pattern }];
  }

  const customers = await CustomersService.context(context).list({
    filter,
    sort: "FullName",
    sortOrder: "asc",
    page: 1,
    pageSize,
  });

  const items: CustomerFilterOption[] = [];
  for (let i = 0; i < customers.length; i++) {
    const customer = typeof customers[i].toObject === "function" ? customers[i].toObject() : customers[i];
    const fullName = customer.FullName || [customer.FirstName, customer.LastName].filter(Boolean).join(" ").trim();
    const label = fullName && customer.Mobile ? `${fullName} (${customer.Mobile})` : fullName || customer.Mobile || customer._id;
    items.push({
      _id: customer._id,
      label,
    });
  }

  return { items };
}

const definition: IRPCFunctionDefinition = {
  callback: ListForAdmin,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
