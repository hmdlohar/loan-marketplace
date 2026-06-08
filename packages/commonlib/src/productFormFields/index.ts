export * from "./types";
export * from "./fields";

import { LOAN_PRODUCT } from "../enums/enums";
import { FormFieldDefinition } from "./types";
import { STATIC_FORM_FIELDS_BY_LOAN_TYPE } from "./fields";

export function getStaticFormFields(loanType: LOAN_PRODUCT): FormFieldDefinition[] {
  return STATIC_FORM_FIELDS_BY_LOAN_TYPE[loanType] || [];
}

export function getFullFormFields(product: {
  LoanType: LOAN_PRODUCT | string;
  FormFields?: FormFieldDefinition[];
}): FormFieldDefinition[] {
  const loanType = product.LoanType as LOAN_PRODUCT;
  return [...getStaticFormFields(loanType), ...(product.FormFields || [])];
}
