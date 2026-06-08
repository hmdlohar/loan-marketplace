import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import CustomersService from "@root/api/customers/CustomersService";

const argsSchema = yup.object({});
export type IGetArgs = yup.InferType<typeof argsSchema>;

type IGetReturnType = any;

export async function Get(args: IGetArgs, context: ICMSContext): Promise<IGetReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const customer = await CustomersService.context(context).findOne({ UserID: context.SystemUserID });
  return customer || null;
}

const definition: IRPCFunctionDefinition = {
  callback: Get,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
