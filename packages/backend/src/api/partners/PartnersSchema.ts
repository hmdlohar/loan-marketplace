import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/dataModifierSchema";
import { createOIdString } from "@root/utils/commonUtils";

export const PartnersCollectionKey = "partners";

export const PartnersSchema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
  Name: { type: String, required: true },
  Logo: { type: String, required: false },
  LogoPath: { type: String, required: false },
});

export type IPartners = InferSchemaType<typeof PartnersSchema> & {};
