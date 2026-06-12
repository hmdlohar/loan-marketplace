import { APPLICATION_STATUS, LOAN_PRODUCT } from "commonlib";

export type MockLoanProduct = {
  id: LOAN_PRODUCT;
  title: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  aprFrom: number;
};

export type MockApplication = {
  id: string;
  product: LOAN_PRODUCT;
  status: APPLICATION_STATUS;
  loanAmount: number;
  updatedAt: string;
};

export type MockOffer = {
  id: string;
  lenderName: string;
  apr: number;
  emi: number;
  totalRepayment: number;
  tenureMonths: number;
  recommended: boolean;
};

const products: MockLoanProduct[] = [
  {
    id: LOAN_PRODUCT.HOME_LOAN,
    title: "Home Loan",
    description: "Purchase or construct your dream home with competitive rates from top banks.",
    minAmount: 500000,
    maxAmount: 50000000,
    aprFrom: 8.4,
  },
  {
    id: LOAN_PRODUCT.LAP,
    title: "Loan Against Property",
    description: "Unlock property value for business or personal needs at flexible tenures.",
    minAmount: 1000000,
    maxAmount: 100000000,
    aprFrom: 9.1,
  },
  {
    id: LOAN_PRODUCT.PERSONAL_LOAN,
    title: "Personal Loan",
    description: "Quick unsecured funding for medical, travel, or consolidation needs.",
    minAmount: 50000,
    maxAmount: 2500000,
    aprFrom: 10.5,
  },
  {
    id: LOAN_PRODUCT.WORKING_CAPITAL,
    title: "Working Capital",
    description: "Fuel business operations with tailored credit lines and term loans.",
    minAmount: 500000,
    maxAmount: 20000000,
    aprFrom: 11.2,
  },
  {
    id: LOAN_PRODUCT.CREDIT_CARD,
    title: "Credit Card",
    description: "Premium cards with rewards, lounge access, and flexible repayment.",
    minAmount: 0,
    maxAmount: 500000,
    aprFrom: 14.0,
  },
];

const offers: MockOffer[] = [
  {
    id: "offer-1",
    lenderName: "HDFC Bank",
    apr: 8.65,
    emi: 42891,
    totalRepayment: 5146920,
    tenureMonths: 120,
    recommended: true,
  },
  {
    id: "offer-2",
    lenderName: "ICICI Bank",
    apr: 8.9,
    emi: 43210,
    totalRepayment: 5185200,
    tenureMonths: 120,
    recommended: false,
  },
  {
    id: "offer-3",
    lenderName: "Axis Finance",
    apr: 9.15,
    emi: 43580,
    totalRepayment: 5229600,
    tenureMonths: 120,
    recommended: false,
  },
];

let activeApplication: MockApplication = {
  id: "app-demo-001",
  product: LOAN_PRODUCT.HOME_LOAN,
  status: APPLICATION_STATUS.CREATED,
  loanAmount: 4500000,
  updatedAt: new Date().toISOString(),
};

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMockProducts() {
  return products;
}

export function getMockOffers() {
  return offers;
}

export function getMockApplication() {
  return activeApplication;
}

export function updateMockApplication(partial: Partial<MockApplication>) {
  activeApplication = {
    ...activeApplication,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  return activeApplication;
}

export function getStatusLabel(status: APPLICATION_STATUS) {
  const labels: Record<APPLICATION_STATUS, string> = {
    [APPLICATION_STATUS.CREATED]: "Draft",
    [APPLICATION_STATUS.PENDING_DOCUMENTS]: "Pending documents",
    [APPLICATION_STATUS.PENDING_FORM]: "Pending form",
    [APPLICATION_STATUS.UNDER_REVIEW]: "Under review",
    [APPLICATION_STATUS.PARTNER_ASSIGNED]: "Partner assigned",
    [APPLICATION_STATUS.APPROVED]: "Approved",
    [APPLICATION_STATUS.REJECTED]: "Rejected",
    [APPLICATION_STATUS.DISBURSED]: "Disbursed",
  };
  return labels[status];
}
