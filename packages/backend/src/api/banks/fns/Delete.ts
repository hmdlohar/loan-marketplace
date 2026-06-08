import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import BanksService from "@root/api/banks/BanksService";

const argsSchema = yup.object({
  _id: yup.string().required(),
});
export type IDeleteArgs = yup.InferType<typeof argsSchema>;

type IDeleteReturnType = { deleted: boolean };

export async function Delete(args: IDeleteArgs, context: ICMSContext): Promise<IDeleteReturnType> {
  await BanksService.context(context).get_Throwable(args._id);
  await BanksService.context(context).delete(args._id);
  return { deleted: true };
}

const definition: IRPCFunctionDefinition = {
  callback: Delete,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
