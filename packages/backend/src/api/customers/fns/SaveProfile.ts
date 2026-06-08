import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { USER_ROLE } from "commonlib";
import CustomersService from "@root/api/customers/CustomersService";

const argsSchema = yup.object({
  FirstName: yup.string().optional(),
  MiddleName: yup.string().optional(),
  LastName: yup.string().optional(),
  FullName: yup.string().optional(),
  Email: yup.string().email().optional(),
  Mobile: yup.string().optional(),
  DOB: yup.string().optional(),
  Gender: yup.string().optional(),
  PANNumber: yup.string().optional(),
  AddressLine1: yup.string().optional(),
  AddressLine2: yup.string().optional(),
  PinCode: yup.string().optional(),
  City: yup.string().optional(),
  State: yup.string().optional(),
  EmploymentType: yup.string().optional(),
  NetIncome: yup.number().optional(),
});
export type ISaveProfileArgs = yup.InferType<typeof argsSchema>;

type ISaveProfileReturnType = any;

export async function SaveProfile(args: ISaveProfileArgs, context: ICMSContext): Promise<ISaveProfileReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const existing = await CustomersService.context(context).findOne({ UserID: context.SystemUserID });
  const payload = {
    UserID: context.SystemUserID,
    FirstName: args.FirstName,
    MiddleName: args.MiddleName,
    LastName: args.LastName,
    FullName: args.FullName,
    Email: args.Email,
    Mobile: args.Mobile,
    DOB: args.DOB,
    Gender: args.Gender,
    PANNumber: args.PANNumber,
    AddressLine1: args.AddressLine1,
    AddressLine2: args.AddressLine2,
    PinCode: args.PinCode,
    City: args.City,
    State: args.State,
    EmploymentType: args.EmploymentType,
    NetIncome: args.NetIncome,
  };

  if (existing) {
    const updatePayload: Record<string, any> = {};
    const keys = Object.keys(payload) as (keyof typeof payload)[];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === "UserID") {
        continue;
      }
      const value = payload[key];
      if (value !== undefined) {
        updatePayload[key] = value;
      }
    }
    return CustomersService.context(context).update(existing._id, updatePayload);
  }

  if (!args.Mobile) {
    throw new Error("Mobile is required to create a customer profile.");
  }

  return CustomersService.context(context).create(payload);
}

const definition: IRPCFunctionDefinition = {
  callback: SaveProfile,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
