import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/dataModifierSchema";
import { createOIdString } from "@root/utils/commonUtils";
import { DOCUMENT_TYPE } from "commonlib";

export const DocumentsCollectionKey = "documents";

const DocumentContextSchema = new Schema(
  {
    ApplicationID: { type: String, required: false },
    UserID: { type: String, required: false },
    CustomerID: { type: String, required: false },
    ProductID: { type: String, required: false },
  },
  { _id: false }
);

export const DocumentsSchema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
  Name: { type: String, required: true },
  Path: { type: String, required: true },
  DocumentType: {
    type: String,
    required: true,
    enum: Object.values(DOCUMENT_TYPE),
  },
  Context: { type: DocumentContextSchema, default: {} },
  ParsedData: { type: Schema.Types.Mixed, required: false },
});

DocumentsSchema.index({ "Context.ApplicationID": 1 });
DocumentsSchema.index({ "Context.UserID": 1 });
DocumentsSchema.index({ "Context.UserID": 1, DocumentType: 1 });

export type IDocuments = InferSchemaType<typeof DocumentsSchema> & {};
