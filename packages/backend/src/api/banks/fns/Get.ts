import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import BanksService from "@root/api/banks/BanksService";

const argsSchema = yup.object({
  _id: yup.string().required(),
});
export type IGetArgs = yup.InferType<typeof argsSchema>;

type IGetReturnType = any;

export async function Get(args: IGetArgs, context: ICMSContext): Promise<IGetReturnType> {
  return BanksService.context(context).get_Throwable(args._id);
}

const definition: IRPCFunctionDefinition = {
  callback: Get,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
};
export default definition;
