import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import UserService from "@root/api/user/UserService";
import { verifyPassword } from "@root/utils/passwordUtil";
import { signUserToken, toPublicUser } from "@root/utils/jwtUtil";

const argsSchema = yup.object({
  Email: yup.string().email().required(),
  Password: yup.string().required(),
});
export type ILoginArgs = yup.InferType<typeof argsSchema>;

type ILoginReturnType = {
  token: string;
  user: ReturnType<typeof toPublicUser>;
};

export async function Login(
  args: ILoginArgs,
  context: ICMSContext,
): Promise<ILoginReturnType> {
  const user = await UserService.context(context).findOne({
    Email: args.Email.toLowerCase().trim(),
  });
  if (!user) {
    throw new Error("Invalid Email or password.");
  }

  const passwordValid = await verifyPassword(args.Password, user.PasswordHash);
  if (!passwordValid) {
    throw new Error("Invalid email or Password.");
  }

  const token = signUserToken(user);

  return {
    token,
    user: toPublicUser(user),
  };
}

const definition: IRPCFunctionDefinition = {
  callback: Login,
  argsSchema,
  access: {
    allow: [USER_ROLE.PUBLIC],
  },
};
export default definition;
