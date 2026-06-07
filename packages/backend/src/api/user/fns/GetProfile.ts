import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import { getContextUser } from "@root/utils/partnerAccessUtil";
import { toPublicUser } from "@root/utils/jwtUtil";

const argsSchema = yup.object({});
export type IGetProfileArgs = yup.InferType<typeof argsSchema>;

type IGetProfileReturnType = ReturnType<typeof toPublicUser>;

export async function GetProfile(args: IGetProfileArgs, context: ICMSContext): Promise<IGetProfileReturnType> {
  const user = await getContextUser(context);
  return toPublicUser(user);
}

const definition: IRPCFunctionDefinition = {
  callback: GetProfile,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED],
  },
};
export default definition;
