import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import BanksService from "@root/api/banks/BanksService";

const argsSchema = yup.object({
  _id: yup.string().required(),
  Name: yup.string().required(),
  LogoPath: yup.string().optional(),
});
export type IUpdateArgs = yup.InferType<typeof argsSchema>;

type IUpdateReturnType = any;

export async function Update(args: IUpdateArgs, context: ICMSContext): Promise<IUpdateReturnType> {
  await BanksService.context(context).get_Throwable(args._id);

  const name = args.Name.trim();
  const duplicate = await BanksService.context(context).findOne({
    Name: name,
    _id: { $ne: args._id },
  });
  if (duplicate) {
    throw new Error("A bank with this name already exists.");
  }

  return BanksService.context(context).update(args._id, {
    Name: name,
    LogoPath: args.LogoPath?.trim() || "",
  });
}

const definition: IRPCFunctionDefinition = {
  callback: Update,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
