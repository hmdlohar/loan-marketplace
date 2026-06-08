import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import BanksService from "@root/api/banks/BanksService";

const argsSchema = yup.object({
  Name: yup.string().required(),
  LogoPath: yup.string().optional(),
});
export type ICreateArgs = yup.InferType<typeof argsSchema>;

type ICreateReturnType = any;

export async function Create(args: ICreateArgs, context: ICMSContext): Promise<ICreateReturnType> {
  const name = args.Name.trim();

  const existing = await BanksService.context(context).findOne({ Name: name });
  if (existing) {
    throw new Error("A bank with this name already exists.");
  }

  return BanksService.context(context).create({
    Name: name,
    LogoPath: args.LogoPath?.trim() || "",
  });
}

const definition: IRPCFunctionDefinition = {
  callback: Create,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
