import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import config from "@root/config";

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
  if (!config.MSG91_OTP_DEV_MODE) {
    throw new Error("OTP is sent via the MSG91 widget on the client.");
  }

  return {
    success: true,
    message: `Dev OTP mode: use code ${config.MSG91_OTP_DEV_CODE}.`,
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
