import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import PartnersService from "@root/api/partners/PartnersService";
import UserService from "@root/api/user/UserService";
import { hashPassword } from "@root/utils/passwordUtil";
import { toPublicUser } from "@root/utils/jwtUtil";

const argsSchema = yup.object({
  _id: yup.string().required(),
  Name: yup.string().required(),
  FullName: yup.string().required(),
  Email: yup.string().email().required(),
  Mobile: yup
    .string()
    .matches(/^\d{10}$/, "Mobile must be 10 digits")
    .required(),
  Password: yup.string().min(6).optional(),
});
export type IUpdateArgs = yup.InferType<typeof argsSchema>;

type IUpdateReturnType = {
  partner: any;
  user: ReturnType<typeof toPublicUser> | null;
};

export async function Update(args: IUpdateArgs, context: ICMSContext): Promise<IUpdateReturnType> {
  await PartnersService.context(context).get_Throwable(args._id);

  const email = args.Email.toLowerCase().trim();
  const user = await UserService.context(context).findOne({
    Role: USER_ROLE.PARTNER,
    "Access.PartnerIDs": args._id,
  });

  if (!user) {
    throw new Error("Partner login account not found.");
  }

  const existingEmail = await UserService.context(context).findOne({
    Email: email,
    _id: { $ne: user._id },
  });
  if (existingEmail) {
    throw new Error("A user with this email already exists.");
  }

  const existingMobile = await UserService.context(context).findOne({
    Mobile: args.Mobile,
    _id: { $ne: user._id },
  });
  if (existingMobile) {
    throw new Error("A user with this mobile already exists.");
  }

  const partner = await PartnersService.context(context).update(args._id, {
    Name: args.Name,
  });

  const userUpdate: Record<string, any> = {
    FullName: args.FullName,
    Email: email,
    Mobile: args.Mobile,
  };

  if (args.Password) {
    userUpdate.PasswordHash = await hashPassword(args.Password);
  }

  await UserService.context(context).update(user._id, userUpdate);

  const updatedUser = await UserService.context(context).get_Throwable(user._id);

  return {
    partner,
    user: toPublicUser(updatedUser),
  };
}

const definition: IRPCFunctionDefinition = {
  callback: Update,
  argsSchema,
  access: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
};
export default definition;
