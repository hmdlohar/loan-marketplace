import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/dataModifierSchema";
import { createOIdString } from "@root/utils/commonUtils";
import { APPLICATION_STATUS } from "commonlib";

export const ApplicationsCollectionKey = "applications";

const DocumentRefsSchema = new Schema(
  {
    PAN: { type: String, required: false },
    AADHAAR: { type: String, required: false },
    SALARY_SLIP: { type: String, required: false },
    BANK_STATEMENT: { type: String, required: false },
    ITR: { type: String, required: false },
    GST_RETURN: { type: String, required: false },
    PROPERTY_DOCUMENT: { type: String, required: false },
  },
  { _id: false }
);

export const ApplicationsSchema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
  UserID: { type: String, required: true, index: true },
  CustomerID: { type: String, required: false, index: true },
  ProductID: { type: String, required: true, index: true },
  Status: {
    type: String,
    required: true,
    enum: Object.values(APPLICATION_STATUS),
    default: APPLICATION_STATUS.CREATED,
  },
  FormData: { type: Schema.Types.Mixed, default: {} },
  DocumentIDs: { type: DocumentRefsSchema, default: {} },
});

ApplicationsSchema.index({ UserID: 1, ProductID: 1 });

export type IApplications = InferSchemaType<typeof ApplicationsSchema> & {};
