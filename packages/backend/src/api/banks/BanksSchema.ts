import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/dataModifierSchema";
import { createOIdString } from "@root/utils/commonUtils";

export const BanksCollectionKey = "banks";

export const BanksSchema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
  Name: { type: String, required: true },
  LogoPath: { type: String, required: false },
});

BanksSchema.index({ Name: 1 }, { unique: true });

export type IBanks = InferSchemaType<typeof BanksSchema> & {};
