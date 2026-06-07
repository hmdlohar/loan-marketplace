import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/dataModifierSchema";
import { createOIdString } from "@root/utils/commonUtils";
import { USER_ROLE } from "commonlib";

export const UserCollectionKey = "user";

const AccessSchema = new Schema(
  {
    PartnerIDs: { type: [String], default: [] },
    CustomerID: { type: String, required: false },
  },
  { _id: false }
);

export const UserSchema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
  Email: { type: String, required: true, unique: true, index: true },
  PasswordHash: { type: String, required: true },
  Mobile: { type: String, required: true, unique: true, index: true },
  FullName: { type: String, required: true },
  Role: {
    type: String,
    required: false,
    enum: [USER_ROLE.SYSTEM_ADMIN, USER_ROLE.PARTNER],
  },
  Access: { type: AccessSchema, required: false },
});

export type IUser = InferSchemaType<typeof UserSchema> & {};
