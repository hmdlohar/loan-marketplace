import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import { msg91SendOtp } from "@root/utils/msg91Util";

const argsSchema = yup.object({
  Mobile: yup
    .string()
    .required()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
});
export type ISendOtpArgs = yup.InferType<typeof argsSchema>;

type ISendOtpReturnType = {
  success: boolean;
  message: string;
};

export async function SendOtp(args: ISendOtpArgs, context: ICMSContext): Promise<ISendOtpReturnType> {
  await msg91SendOtp(args.Mobile);
  return {
    success: true,
    message: "OTP sent successfully.",
  };
}

const definition: IRPCFunctionDefinition = {
  callback: SendOtp,
  argsSchema,
  access: {
    allow: [USER_ROLE.PUBLIC],
  },
};
export default definition;
