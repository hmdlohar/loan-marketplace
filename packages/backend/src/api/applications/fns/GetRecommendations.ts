import * as yup from "yup";
import { IRPCFunctionDefinition } from "@root/types/rpc";
import { ICMSContext } from "@root/types/cms";
import { LOAN_PRODUCT, USER_ROLE } from "commonlib";
import ApplicationsService from "@root/api/applications/ApplicationsService";
import ProductsService from "@root/api/products/ProductsService";
import BanksService from "@root/api/banks/BanksService";
import CustomersService from "@root/api/customers/CustomersService";

const argsSchema = yup.object({
  ApplicationID: yup.string().required(),
});
export type IGetRecommendationsArgs = yup.InferType<typeof argsSchema>;

type IRecommendationItem = {
  Product: any;
  approvalScore: number;
  reason: string;
  interestRate: number | null;
  emi: number | null;
  totalRepayment: number | null;
  tenureMonths: number | null;
};

type IGetRecommendationsReturnType = {
  items: IRecommendationItem[];
};

const defaultTenureMonths: Record<string, number> = {
  [LOAN_PRODUCT.PERSONAL_LOAN]: 36,
  [LOAN_PRODUCT.HOME_LOAN]: 240,
  [LOAN_PRODUCT.LAP]: 120,
  [LOAN_PRODUCT.WORKING_CAPITAL]: 24,
  [LOAN_PRODUCT.CREDIT_CARD]: 0,
};

const defaultRate: Record<string, number> = {
  [LOAN_PRODUCT.PERSONAL_LOAN]: 13,
  [LOAN_PRODUCT.HOME_LOAN]: 8.6,
  [LOAN_PRODUCT.LAP]: 9.5,
  [LOAN_PRODUCT.WORKING_CAPITAL]: 14,
  [LOAN_PRODUCT.CREDIT_CARD]: 36,
};

function toNumber(value: any): number {
  if (value === undefined || value === null || value === "") {
    return 0;
  }
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function ageFromDob(dob: any): number {
  if (!dob) {
    return 0;
  }
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) {
    return 0;
  }
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age = age - 1;
  }
  return age;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeEmi(principal: number, annualRate: number, tenureMonths: number): number {
  if (!principal || !tenureMonths) {
    return 0;
  }
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export async function GetRecommendations(
  args: IGetRecommendationsArgs,
  context: ICMSContext
): Promise<IGetRecommendationsReturnType> {
  if (!context.SystemUserID || context.SystemUserID === "DEFAULT") {
    throw new Error("Authentication required.");
  }

  const application = await ApplicationsService.context(context).get_Throwable(args.ApplicationID);
  if (application.UserID !== context.SystemUserID) {
    throw new Error("You do not have access to this application.");
  }

  const applicationObj = application.toObject ? application.toObject() : application;
  const loanType = applicationObj.LoanType;
  const formData = applicationObj.FormData || {};

  let customerProfile: any = {};
  if (applicationObj.CustomerID) {
    const customerDoc = await CustomersService.context(context).findOne({ _id: applicationObj.CustomerID });
    if (customerDoc) {
      customerProfile = customerDoc.toObject ? customerDoc.toObject() : customerDoc;
    }
  }

  const amount = toNumber(formData.desiredLoanAmount) || toNumber(formData.loanAmount) || toNumber(formData.propertyValue);
  const income = toNumber(formData.netIncome) || toNumber(formData.income) || toNumber(customerProfile.NetIncome);
  const age = ageFromDob(formData.dob || customerProfile.DOB);
  const employment = String(
    formData.employmentType || formData.employment || formData.occupation || customerProfile.EmploymentType || ""
  ).toLowerCase();

  let requestedTenure = toNumber(formData.loanTenure);
  if (loanType === LOAN_PRODUCT.HOME_LOAN && requestedTenure && requestedTenure <= 40) {
    requestedTenure = requestedTenure * 12;
  }

  const products = await ProductsService.context(context).list({
    filter: { LoanType: loanType },
    sort: "ModifiedAt",
    sortOrder: "desc",
    page: 1,
    pageSize: 100,
  });

  const recommendations: IRecommendationItem[] = [];

  for (let i = 0; i < products.length; i++) {
    const productObj = typeof products[i].toObject === "function" ? products[i].toObject() : products[i];
    const eligibility = productObj.Eligibility || {};

    if (eligibility.MinLoanAmount && amount && amount < eligibility.MinLoanAmount) {
      continue;
    }
    if (eligibility.MaxLoanAmount && amount && amount > eligibility.MaxLoanAmount) {
      continue;
    }
    if (eligibility.MinMonthlyIncome && income && income < eligibility.MinMonthlyIncome) {
      continue;
    }
    if (eligibility.MinAge && age && age < eligibility.MinAge) {
      continue;
    }
    if (eligibility.MaxAge && age && age > eligibility.MaxAge) {
      continue;
    }
    if (eligibility.MinTenureMonths && requestedTenure && requestedTenure < eligibility.MinTenureMonths) {
      continue;
    }
    if (eligibility.MaxTenureMonths && requestedTenure && requestedTenure > eligibility.MaxTenureMonths) {
      continue;
    }
    if (
      eligibility.AllowedEmploymentTypes &&
      eligibility.AllowedEmploymentTypes.length &&
      employment &&
      !eligibility.AllowedEmploymentTypes.some((allowed: string) => allowed.toLowerCase() === employment)
    ) {
      continue;
    }

    let incomeStrength = 0.6;
    if (eligibility.MinMonthlyIncome && income) {
      incomeStrength = clamp(income / (eligibility.MinMonthlyIncome * 2), 0, 1);
    } else if (income) {
      incomeStrength = 0.75;
    }

    let amountStrength = 0.7;
    if (eligibility.MaxLoanAmount && amount) {
      amountStrength = clamp(1 - amount / eligibility.MaxLoanAmount, 0, 1);
    }

    const profileStrength = clamp(incomeStrength * 0.6 + amountStrength * 0.4, 0, 1);

    let interestRate: number | null = null;
    if (eligibility.InterestRateMin !== undefined && eligibility.InterestRateMax !== undefined) {
      interestRate = eligibility.InterestRateMax - profileStrength * (eligibility.InterestRateMax - eligibility.InterestRateMin);
    } else if (eligibility.InterestRateMin !== undefined) {
      interestRate = eligibility.InterestRateMin;
    } else if (eligibility.InterestRateMax !== undefined) {
      interestRate = eligibility.InterestRateMax;
    } else {
      interestRate = defaultRate[loanType] ?? null;
    }
    if (interestRate !== null) {
      interestRate = Math.round(interestRate * 100) / 100;
    }

    let rateStrength = 0.5;
    if (
      interestRate !== null &&
      eligibility.InterestRateMin !== undefined &&
      eligibility.InterestRateMax !== undefined &&
      eligibility.InterestRateMax > eligibility.InterestRateMin
    ) {
      rateStrength = clamp(
        (eligibility.InterestRateMax - interestRate) / (eligibility.InterestRateMax - eligibility.InterestRateMin),
        0,
        1
      );
    }

    const approvalScore = Math.round(clamp(60 + (incomeStrength * 0.5 + amountStrength * 0.3 + rateStrength * 0.2) * 38, 60, 98));

    let reason = "Your profile is a good fit for this product.";
    if (incomeStrength >= amountStrength && incomeStrength >= rateStrength) {
      reason = "Strong income profile relative to this lender's criteria.";
    } else if (amountStrength >= rateStrength) {
      reason = "Your requested amount sits comfortably within this product's limits.";
    } else {
      reason = "Competitive interest rate available for your profile.";
    }

    const tenureMonths =
      loanType === LOAN_PRODUCT.CREDIT_CARD ? 0 : requestedTenure || defaultTenureMonths[loanType] || 0;

    let emi: number | null = null;
    let totalRepayment: number | null = null;
    if (tenureMonths && amount && interestRate !== null) {
      emi = Math.round(computeEmi(amount, interestRate, tenureMonths));
      totalRepayment = emi * tenureMonths;
    }

    let bank = null;
    if (productObj.BankID) {
      const bankDoc = await BanksService.context(context).findOne({ _id: productObj.BankID });
      if (bankDoc) {
        const bankObj = bankDoc.toObject ? bankDoc.toObject() : bankDoc;
        bank = { _id: bankObj._id, Name: bankObj.Name, LogoPath: bankObj.LogoPath };
      }
    }

    recommendations.push({
      Product: { ...productObj, Bank: bank },
      approvalScore,
      reason,
      interestRate,
      emi,
      totalRepayment,
      tenureMonths: tenureMonths || null,
    });
  }

  recommendations.sort((a, b) => b.approvalScore - a.approvalScore);

  return { items: recommendations.slice(0, 5) };
}

const definition: IRPCFunctionDefinition = {
  callback: GetRecommendations,
  argsSchema,
  access: {
    allow: [USER_ROLE.AUTHENTICATED, USER_ROLE.CUSTOMER],
  },
};
export default definition;
