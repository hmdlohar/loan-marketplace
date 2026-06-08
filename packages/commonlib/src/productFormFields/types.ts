import { LOAN_PRODUCT } from "../enums/enums";

export interface FormFieldValidation {
  min?: number;
  max?: number;
  minAge?: number;
  maxAge?: number;
  errorMessage?: string;
}

export interface FormFieldDefinition {
  Key: string;
  Label: string;
  Type: string;
  Section?: string;
  Required: boolean;
  Placeholder?: string;
  Options?: string[];
  Validation?: FormFieldValidation;
}

export type StaticFormFieldsByLoanType = Record<LOAN_PRODUCT, FormFieldDefinition[]>;
