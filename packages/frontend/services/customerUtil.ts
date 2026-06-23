import { LOAN_PRODUCT } from "commonlib";

export const loanProductLabels: Record<string, string> = {
  [LOAN_PRODUCT.HOME_LOAN]: "Home Loan",
  [LOAN_PRODUCT.LAP]: "Loan Against Property",
  [LOAN_PRODUCT.PERSONAL_LOAN]: "Personal Loan",
  [LOAN_PRODUCT.WORKING_CAPITAL]: "Working Capital",
  [LOAN_PRODUCT.CREDIT_CARD]: "Credit Card",
};

export const loanProductDescriptions: Record<string, string> = {
  [LOAN_PRODUCT.HOME_LOAN]: "Finance your home purchase or construction with competitive bank rates.",
  [LOAN_PRODUCT.LAP]: "Unlock property value for business expansion or personal goals.",
  [LOAN_PRODUCT.PERSONAL_LOAN]: "Quick unsecured funding for life's important moments.",
  [LOAN_PRODUCT.WORKING_CAPITAL]: "Fuel inventory, payroll, and growth with flexible business credit.",
  [LOAN_PRODUCT.CREDIT_CARD]: "Premium cards with rewards, lounge access, and flexible repayment.",
};

export const loanProductOrder = [
  LOAN_PRODUCT.PERSONAL_LOAN,
  LOAN_PRODUCT.CREDIT_CARD,
  LOAN_PRODUCT.HOME_LOAN,
  LOAN_PRODUCT.LAP,
  LOAN_PRODUCT.WORKING_CAPITAL,
];

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function customerFormKeyToProfileKey(key: string) {
  const map: Record<string, string> = {
    mobile: "Mobile",
    firstName: "FirstName",
    middleName: "MiddleName",
    lastName: "LastName",
    fullName: "FullName",
    email: "Email",
    dob: "DOB",
    gender: "Gender",
    panNumber: "PANNumber",
    addressLine1: "AddressLine1",
    addressLine2: "AddressLine2",
    pinCode: "PinCode",
    city: "City",
    state: "State",
    employmentType: "EmploymentType",
    employment: "EmploymentType",
    occupation: "EmploymentType",
    netIncome: "NetIncome",
    income: "NetIncome",
  };
  return map[key] || "";
}

export function getProfileValueForFormKey(fieldKey: string, profile: Record<string, any> | null) {
  if (!profile) {
    return "";
  }

  const storedFormData = profile.FormData && typeof profile.FormData === "object" ? profile.FormData : null;
  if (
    storedFormData &&
    storedFormData[fieldKey] !== undefined &&
    storedFormData[fieldKey] !== null &&
    storedFormData[fieldKey] !== ""
  ) {
    return String(storedFormData[fieldKey]);
  }

  const profileKey = customerFormKeyToProfileKey(fieldKey);
  if (profileKey && profile[profileKey] !== undefined && profile[profileKey] !== null && profile[profileKey] !== "") {
    return String(profile[profileKey]);
  }

  return "";
}

export function buildInitialFormValues(fields: { Key: string }[], profile: Record<string, any> | null) {
  const values: Record<string, string> = {};
  if (!profile) {
    return values;
  }

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const value = getProfileValueForFormKey(field.Key, profile);
    if (value) {
      values[field.Key] = value;
    }
  }

  return values;
}

export function buildMergedFormValues(
  fields: { Key: string }[],
  profile: Record<string, any> | null,
  existingFormData: Record<string, any> | null | undefined,
  authMobile?: string
) {
  const values: Record<string, string> = {};
  for (let i = 0; i < fields.length; i++) {
    const fieldKey = fields[i].Key;
    values[fieldKey] = "";
    const profileValue = getProfileValueForFormKey(fieldKey, profile);
    if (profileValue) {
      values[fieldKey] = profileValue;
    }
  }

  const formData = existingFormData || {};
  const formDataKeys = Object.keys(formData);
  for (let i = 0; i < formDataKeys.length; i++) {
    const key = formDataKeys[i];
    const value = formData[key];
    if (value !== undefined && value !== null && value !== "") {
      values[key] = String(value);
    }
  }

  if (authMobile && values.mobile !== undefined && !values.mobile) {
    values.mobile = authMobile;
  }

  return values;
}
