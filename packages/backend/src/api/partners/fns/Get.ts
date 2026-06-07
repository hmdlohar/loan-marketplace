import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import PartnersService from "@root/api/partners/PartnersService";
import UserService from "@root/api/user/UserService";
import { toPublicUser } from "@root/utils/jwtUtil";

const argsSchema = yup.object({
  _id: yup.string().required(),
});
export type IGetArgs = yup.InferType<typeof argsSchema>;

type IGetReturnType = {
  partner: any;
  user: ReturnType<typeof toPublicUser> | null;
};

export async function Get(args: IGetArgs, context: ICMSContext): Promise<IGetReturnType> {
  const partner = await PartnersService.context(context).get_Throwable(args._id);

  const user = await UserService.context(context).findOne({
    Role: USER_ROLE.PARTNER,
    "Access.PartnerIDs": args._id,
  });

  return {
    partner,
    user: user ? toPublicUser(user) : null,
  };
}

const definition: IRPCFunctionDefinition = {
  callback: Get,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
