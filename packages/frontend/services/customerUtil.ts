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

export function buildInitialFormValues(fields: { Key: string }[], profile: Record<string, any> | null) {
  const values: Record<string, string> = {};
  if (!profile) {
    return values;
  }

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const profileKey = customerFormKeyToProfileKey(field.Key);
    if (!profileKey) {
      continue;
    }
    const value = profile[profileKey];
    if (value !== undefined && value !== null && value !== "") {
      values[field.Key] = String(value);
    }
  }

  return values;
}

type MockOfferInput = {
  lenders: { name: string; logoPath?: string }[];
  loanAmount: number;
  tenureMonths: number;
};

export function buildRandomOffers(input: MockOfferInput) {
  const lenders = input.lenders.length
    ? input.lenders
    : [
        { name: "HDFC Bank" },
        { name: "ICICI Bank" },
        { name: "Axis Bank" },
        { name: "Kotak Mahindra Bank" },
      ];

  const offers = [];
  for (let i = 0; i < Math.min(3, lenders.length); i++) {
    const lender = lenders[i];
    const apr = 8.5 + Math.random() * 4;
    const tenureMonths = input.tenureMonths || 60;
    const principal = input.loanAmount || 500000;
    const monthlyRate = apr / 12 / 100;
    const emi =
      monthlyRate === 0
        ? principal / tenureMonths
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
          (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    const totalRepayment = emi * tenureMonths;

    offers.push({
      id: `offer-${i + 1}`,
      lenderName: lender.name,
      logoPath: lender.logoPath,
      apr,
      emi: Math.round(emi),
      totalRepayment: Math.round(totalRepayment),
      tenureMonths,
      recommended: i === 0,
    });
  }

  return offers.sort((a, b) => a.apr - b.apr).map((offer, index) => ({
    ...offer,
    recommended: index === 0,
  }));
}
