import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/dataModifierSchema";
import { createOIdString } from "@root/utils/commonUtils";

export const CustomersCollectionKey = "customers";

export const CustomersSchema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
  UserID: { type: String, required: true, unique: true, index: true },
  FirstName: { type: String, required: false },
  MiddleName: { type: String, required: false },
  LastName: { type: String, required: false },
  FullName: { type: String, required: false },
  Email: { type: String, required: false },
  Mobile: { type: String, required: true },
  DOB: { type: String, required: false },
  Gender: { type: String, required: false },
  PANNumber: { type: String, required: false },
  AddressLine1: { type: String, required: false },
  AddressLine2: { type: String, required: false },
  PinCode: { type: String, required: false },
  City: { type: String, required: false },
  State: { type: String, required: false },
  EmploymentType: { type: String, required: false },
  NetIncome: { type: Number, required: false },
  FormData: { type: Schema.Types.Mixed, default: {} },
});

export type ICustomers = InferSchemaType<typeof CustomersSchema> & {};
