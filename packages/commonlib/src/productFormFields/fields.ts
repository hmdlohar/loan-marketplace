import { LOAN_PRODUCT } from "../enums/enums";
import { FormFieldDefinition, StaticFormFieldsByLoanType } from "./types";

const personalLoanFields: FormFieldDefinition[] = [
  { Key: "mobile", Label: "Mobile Number", Type: "mobile", Section: "Basic Details", Required: true },
  { Key: "firstName", Label: "First Name", Type: "text", Section: "Basic Details", Required: true },
  { Key: "middleName", Label: "Middle Name", Type: "text", Section: "Basic Details", Required: false },
  { Key: "lastName", Label: "Last Name", Type: "text", Section: "Basic Details", Required: true },
  { Key: "panNumber", Label: "PAN Number", Type: "text", Section: "Basic Details", Required: true, Placeholder: "Enter PAN (e.g. ABCDE1234F)" },
  { Key: "dob", Label: "Date of Birth", Type: "date", Section: "Basic Details", Required: true },
  { Key: "email", Label: "Email Address", Type: "email", Section: "Basic Details", Required: true },
  { Key: "gender", Label: "Gender", Type: "select", Section: "Personal Details", Required: true, Options: ["Male", "Female"] },
  { Key: "addressLine1", Label: "Current Address (Line 1)", Type: "text", Section: "Personal Details", Required: true },
  { Key: "addressLine2", Label: "Current Address (Line 2)", Type: "text", Section: "Personal Details", Required: false },
  { Key: "pinCode", Label: "Current Address Pincode", Type: "number", Section: "Personal Details", Required: true, Placeholder: "Enter 6-digit pincode" },
  { Key: "city", Label: "City", Type: "text", Section: "Personal Details", Required: true },
  { Key: "state", Label: "State", Type: "text", Section: "Personal Details", Required: true },
  { Key: "employmentType", Label: "Employment Type", Type: "select", Section: "Professional Details", Required: true, Options: ["Salaried", "Self-Employed"] },
  { Key: "incomeMode", Label: "Mode of Salary/Income", Type: "select", Section: "Professional Details", Required: true, Options: ["Bank Transfer", "Cash", "Cheque"] },
  { Key: "netIncome", Label: "Net Monthly Income", Type: "number", Section: "Professional Details", Required: true, Placeholder: "Enter monthly income in ₹" },
  { Key: "desiredLoanAmount", Label: "Desired Loan Amount", Type: "number", Section: "Loan Requirement Details", Required: true, Placeholder: "Enter amount in ₹" },
  { Key: "loanTenure", Label: "Loan Tenure (Months)", Type: "number", Section: "Loan Requirement Details", Required: true, Placeholder: "Enter tenure in months" },
];

const creditCardFields: FormFieldDefinition[] = [
  { Key: "mobile", Label: "Mobile Number", Type: "mobile", Section: "Basic Details", Required: true },
  { Key: "firstName", Label: "First Name", Type: "text", Section: "Basic Details", Required: true },
  { Key: "lastName", Label: "Last Name", Type: "text", Section: "Basic Details", Required: true },
  { Key: "panNumber", Label: "PAN Number", Type: "text", Section: "Basic Details", Required: true },
  { Key: "dob", Label: "Date of Birth", Type: "date", Section: "Basic Details", Required: true },
  { Key: "email", Label: "Email Address", Type: "email", Section: "Basic Details", Required: true },
  { Key: "pinCode", Label: "Residential Pincode", Type: "number", Section: "Personal Details", Required: true },
  { Key: "city", Label: "City", Type: "text", Section: "Personal Details", Required: false },
  { Key: "state", Label: "State", Type: "text", Section: "Personal Details", Required: false },
  { Key: "occupation", Label: "Occupation", Type: "select", Section: "Professional Details", Required: true },
  { Key: "netIncome", Label: "Monthly Income", Type: "number", Section: "Professional Details", Required: true, Placeholder: "Enter monthly income in ₹" },
];

const workingCapitalFields: FormFieldDefinition[] = [
  { Key: "mobile", Label: "Mobile Number", Type: "mobile", Section: "Basic Details", Required: true },
  { Key: "fullName", Label: "Full Name (as per PAN)", Type: "text", Section: "Basic Details", Required: true },
  { Key: "email", Label: "Email Address", Type: "email", Section: "Basic Details", Required: true },
  { Key: "loanAmount", Label: "Loan Amount Required", Type: "number", Section: "Loan Details", Required: true, Placeholder: "Enter amount in ₹" },
  { Key: "loanTenure", Label: "Loan Tenure", Type: "number", Section: "Loan Details", Required: true },
  { Key: "income", Label: "Net Monthly Income", Type: "number", Section: "Financial Details", Required: true, Placeholder: "Enter net monthly income in ₹" },
  { Key: "employment", Label: "Employment Type", Type: "select", Section: "Employment Details", Required: true, Options: ["Salaried", "Self-Employed", "Business Owner", "Professional"] },
];

const lapFields: FormFieldDefinition[] = [
  { Key: "mobile", Label: "Mobile Number", Type: "mobile", Section: "Basic Details", Required: true },
  { Key: "firstName", Label: "First Name", Type: "text", Section: "Basic Details", Required: true },
  { Key: "lastName", Label: "Last Name", Type: "text", Section: "Basic Details", Required: true },
  { Key: "email", Label: "Email Address", Type: "email", Section: "Basic Details", Required: true },
  { Key: "panNumber", Label: "PAN Number", Type: "text", Section: "Basic Details", Required: true },
  { Key: "propertyValue", Label: "Property Value", Type: "number", Section: "Property Details", Required: true, Placeholder: "Enter property value in ₹" },
  { Key: "loanAmount", Label: "Loan Amount Required", Type: "number", Section: "Loan Details", Required: true, Placeholder: "Enter amount in ₹" },
  { Key: "pinCode", Label: "Property Pincode", Type: "number", Section: "Property Details", Required: true },
];

const homeLoanFields: FormFieldDefinition[] = [
  { Key: "mobile", Label: "Mobile Number", Type: "mobile", Section: "Basic Details", Required: true },
  { Key: "firstName", Label: "First Name", Type: "text", Section: "Basic Details", Required: true },
  { Key: "lastName", Label: "Last Name", Type: "text", Section: "Basic Details", Required: true },
  { Key: "email", Label: "Email Address", Type: "email", Section: "Basic Details", Required: true },
  { Key: "panNumber", Label: "PAN Number", Type: "text", Section: "Basic Details", Required: true },
  { Key: "propertyValue", Label: "Property Value", Type: "number", Section: "Property Details", Required: true, Placeholder: "Enter property value in ₹" },
  { Key: "loanAmount", Label: "Loan Amount Required", Type: "number", Section: "Loan Details", Required: true, Placeholder: "Enter amount in ₹" },
  { Key: "loanTenure", Label: "Loan Tenure (Years)", Type: "number", Section: "Loan Details", Required: true },
  { Key: "netIncome", Label: "Net Monthly Income", Type: "number", Section: "Financial Details", Required: true },
];

export const STATIC_FORM_FIELDS_BY_LOAN_TYPE: StaticFormFieldsByLoanType = {
  [LOAN_PRODUCT.PERSONAL_LOAN]: personalLoanFields,
  [LOAN_PRODUCT.CREDIT_CARD]: creditCardFields,
  [LOAN_PRODUCT.WORKING_CAPITAL]: workingCapitalFields,
  [LOAN_PRODUCT.LAP]: lapFields,
  [LOAN_PRODUCT.HOME_LOAN]: homeLoanFields,
};

/** Normalized keys used to detect duplicates when importing additional fields. */
export const STATIC_FIELD_KEY_ALIASES: Record<string, string> = {
  pan: "panNumber",
  pincode: "pinCode",
  desiredLoanAmount: "desiredLoanAmount",
  loanAmount: "loanAmount",
};

export function normalizeFieldKey(key: string): string {
  return STATIC_FIELD_KEY_ALIASES[key] || key;
}

export function getStaticFormFieldKeys(loanType: LOAN_PRODUCT): Set<string> {
  const fields = STATIC_FORM_FIELDS_BY_LOAN_TYPE[loanType] || [];
  return new Set(fields.map((field) => normalizeFieldKey(field.Key)));
}
