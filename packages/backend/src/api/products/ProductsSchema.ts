import { Schema, InferSchemaType } from "mongoose";
import { dataModifierSchema } from "@lib/dataModifierSchema";
import { createOIdString } from "@root/utils/commonUtils";
import { LOAN_PRODUCT } from "commonlib";

export const ProductsCollectionKey = "products";

const FormFieldValidationSchema = new Schema(
  {
    min: { type: Number, required: false },
    max: { type: Number, required: false },
    minAge: { type: Number, required: false },
    maxAge: { type: Number, required: false },
    errorMessage: { type: String, required: false },
  },
  { _id: false }
);

const FormFieldSchema = new Schema(
  {
    Key: { type: String, required: true },
    Label: { type: String, required: true },
    Type: { type: String, required: true },
    Section: { type: String, required: false },
    Required: { type: Boolean, required: true, default: false },
    Placeholder: { type: String, required: false },
    Options: { type: [String], default: undefined },
    Validation: { type: FormFieldValidationSchema, required: false },
  },
  { _id: false }
);

const EligibilitySchema = new Schema(
  {
    InterestRateMin: { type: Number, required: false },
    InterestRateMax: { type: Number, required: false },
    MinLoanAmount: { type: Number, required: false },
    MaxLoanAmount: { type: Number, required: false },
    MinMonthlyIncome: { type: Number, required: false },
    MinAge: { type: Number, required: false },
    MaxAge: { type: Number, required: false },
    MinTenureMonths: { type: Number, required: false },
    MaxTenureMonths: { type: Number, required: false },
    AllowedEmploymentTypes: { type: [String], default: undefined },
  },
  { _id: false }
);

export const ProductsSchema = new Schema({
  ...dataModifierSchema,
  _id: { type: String, default: createOIdString },
  Title: { type: String, required: true },
  Slug: { type: String, required: true },
  ShortDescription: { type: String, required: true },
  KeyBenefits: { type: [String], default: [] },
  LoanType: {
    type: String,
    required: true,
    enum: Object.values(LOAN_PRODUCT),
  },
  BankID: { type: String, required: true, index: true },
  PartnerID: { type: String, required: true, index: true },
  FormFields: { type: [FormFieldSchema], default: [] },
  Eligibility: { type: EligibilitySchema, required: false },
});

ProductsSchema.index({ PartnerID: 1, Slug: 1 }, { unique: true });

export type IProducts = InferSchemaType<typeof ProductsSchema> & {};
