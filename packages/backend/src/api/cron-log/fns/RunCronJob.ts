import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";

const argsSchema = yup.object({});
export type IRunCronJobArgs = yup.InferType<typeof argsSchema>;

type IRunCronJobReturnType = any;

export async function RunCronJob(
  args: IRunCronJobArgs,
  context: ICMSContext
): Promise<IRunCronJobReturnType> {
  // Implement RPC logic
  return [];
}

const definition: IRPCFunctionDefinition = {
  callback: RunCronJob,
  argsSchema,
};
export default definition;
