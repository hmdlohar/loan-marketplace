import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import UserService from "@root/api/user/UserService";
import CustomersService from "@root/api/customers/CustomersService";
import { hashPassword } from "@root/utils/passwordUtil";
import { signUserToken, toPublicUser } from "@root/utils/jwtUtil";
import { msg91WidgetVerifyOtpServer, msg91VerifyAccessTokenMobile, msg91VerifyDevOtp } from "@root/utils/msg91Util";
import { createOIdString } from "@root/utils/commonUtils";
import config from "@root/config";

const mobileSchema = yup
  .string()
  .required()
  .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.");

const argsSchema = yup.object({
  AccessToken: yup.string().trim().optional(),
  ReqId: yup.string().trim().optional(),
  Mobile: yup.string().optional(),
  Otp: yup.string().optional(),
  FullName: yup.string().optional(),
});
export type IVerifyOtpArgs = yup.InferType<typeof argsSchema>;

type IVerifyOtpReturnType = {
  token: string;
  user: ReturnType<typeof toPublicUser>;
};

export async function VerifyOtp(args: IVerifyOtpArgs, context: ICMSContext): Promise<IVerifyOtpReturnType> {
  let mobile: string;

  if (config.MSG91_OTP_DEV_MODE) {
    if (!args.Mobile?.trim()) {
      throw new Error("Mobile is required.");
    }
    const mobileValue = await mobileSchema.validate(args.Mobile.trim());
    if (!args.Otp?.trim()) {
      throw new Error("OTP is required.");
    }
    msg91VerifyDevOtp(args.Otp);
    mobile = mobileValue;
  } else if (args.AccessToken?.trim()) {
    mobile = await msg91VerifyAccessTokenMobile(args.AccessToken.trim());
  } else {
    const reqId = args.ReqId?.trim();
    const otp = args.Otp?.trim();
    if (!reqId || !otp) {
      throw new Error("ReqId and OTP are required.");
    }
    if (!args.Mobile?.trim()) {
      throw new Error("Mobile is required.");
    }
    const mobileValue = await mobileSchema.validate(args.Mobile.trim());
    mobile = await msg91WidgetVerifyOtpServer(reqId, otp, mobileValue);
  }

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

    if (!user) {
      throw new Error("Unable to create user.");
    }

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
