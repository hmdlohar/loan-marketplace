import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/dataModifierSchema";
import { createOIdString } from "@root/utils/commonUtils";

export const CronLogCollectionKey = "cron-log";

export const CronLogSchema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
  Key: { type: String, required: true },
  Status: { type: String, required: true },
  Comment: { type: String, required: true },
  Data: { type: Object },
  ex: { type: Object },
});

export type ICronLog = InferSchemaType<typeof CronLogSchema> & {};
