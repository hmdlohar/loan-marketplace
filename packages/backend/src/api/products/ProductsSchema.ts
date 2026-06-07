import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/dataModifierSchema";
import { createOIdString } from "@root/utils/commonUtils";
import { LOAN_PRODUCT } from "commonlib";

export const ProductsCollectionKey = "products";

const FormFieldSchema = new Schema(
  {
    Label: { type: String, required: true },
    Type: { type: String, required: true },
    Required: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

export const ProductsSchema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
  Title: { type: String, required: true },
  Slug: { type: String, required: true },
  ShortDescription: { type: String, required: true },
  LongDescription: { type: String, required: true },
  LoanType: {
    type: String,
    required: true,
    enum: Object.values(LOAN_PRODUCT),
  },
  PartnerID: { type: String, required: true, index: true },
  MainImage: { type: String, required: false },
  FormFields: { type: [FormFieldSchema], default: [] },
});

ProductsSchema.index({ PartnerID: 1, Slug: 1 }, { unique: true });

export type IProducts = InferSchemaType<typeof ProductsSchema> & {};
