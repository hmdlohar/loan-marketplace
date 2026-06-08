import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import UserService from "@root/api/user/UserService";
import CustomersService from "@root/api/customers/CustomersService";
import { hashPassword } from "@root/utils/passwordUtil";
import { signUserToken, toPublicUser } from "@root/utils/jwtUtil";
import { msg91VerifyOtp } from "@root/utils/msg91Util";
import { createOIdString } from "@root/utils/commonUtils";

const argsSchema = yup.object({
  Mobile: yup
    .string()
    .required()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
  Otp: yup.string().required().min(4).max(9),
  FullName: yup.string().optional(),
});
export type IVerifyOtpArgs = yup.InferType<typeof argsSchema>;

type IVerifyOtpReturnType = {
  token: string;
  user: ReturnType<typeof toPublicUser>;
};

export async function VerifyOtp(args: IVerifyOtpArgs, context: ICMSContext): Promise<IVerifyOtpReturnType> {
  await msg91VerifyOtp(args.Mobile, args.Otp);

  const mobile = args.Mobile.trim();
  let user = await UserService.context(context).findOne({ Mobile: mobile });

  if (!user) {
    const fullName = args.FullName?.trim() || "Customer";
    const email = `${mobile}@customers.local`;
    const passwordHash = await hashPassword(createOIdString());

    user = await UserService.context(context).create({
      Email: email,
      PasswordHash: passwordHash,
      Mobile: mobile,
      FullName: fullName,
      Access: {
        PartnerIDs: [],
      },
    });

    const customer = await CustomersService.context(context).create({
      UserID: user._id,
      Mobile: mobile,
      FullName: fullName,
    });

    const updatedUser = await UserService.context(context).update(user._id, {
      Access: {
        PartnerIDs: [],
        CustomerID: customer._id,
      },
    });
    user = updatedUser;
  } else if (args.FullName?.trim() && user.FullName !== args.FullName.trim()) {
    user = await UserService.context(context).update(user._id, {
      FullName: args.FullName.trim(),
    });
  }

  if (!user) {
    throw new Error("Unable to create or load user.");
  }

  const token = signUserToken(user);

  return {
    token,
    user: toPublicUser(user),
  };
}

const definition: IRPCFunctionDefinition = {
  callback: VerifyOtp,
  argsSchema,
  access: {
    allow: [USER_ROLE.PUBLIC],
  },
};
export default definition;
