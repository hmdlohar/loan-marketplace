import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";

const argsSchema = yup.object({});
export type IRunCronJobArgs = yup.InferType<typeof argsSchema>;

type IRunCronJobReturnType = any;

export async function RunCronJob(
  args: IRunCronJobArgs,
  context: ICMSContext,
): Promise<IRunCronJobReturnType> {
  return [];
}

const definition: IRPCFunctionDefinition = {
  callback: RunCronJob,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
