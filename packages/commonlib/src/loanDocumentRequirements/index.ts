import { DOCUMENT_TYPE, LOAN_PRODUCT } from "../enums/enums";

export type LoanDocumentRequirement = {
  type: DOCUMENT_TYPE;
  label: string;
};

const documentLabels: Record<DOCUMENT_TYPE, string> = {
  [DOCUMENT_TYPE.PAN]: "PAN card",
  [DOCUMENT_TYPE.AADHAAR]: "Aadhaar",
  [DOCUMENT_TYPE.SALARY_SLIP]: "Salary slip (last 3 months)",
  [DOCUMENT_TYPE.BANK_STATEMENT]: "Bank statement (6 months)",
  [DOCUMENT_TYPE.ITR]: "Income tax return (ITR)",
  [DOCUMENT_TYPE.GST_RETURN]: "GST returns",
  [DOCUMENT_TYPE.PROPERTY_DOCUMENT]: "Property documents",
};

const REQUIRED_DOCUMENTS_BY_LOAN_TYPE: Record<LOAN_PRODUCT, DOCUMENT_TYPE[]> = {
  [LOAN_PRODUCT.PERSONAL_LOAN]: [
    DOCUMENT_TYPE.PAN,
    DOCUMENT_TYPE.AADHAAR,
    DOCUMENT_TYPE.SALARY_SLIP,
    DOCUMENT_TYPE.BANK_STATEMENT,
  ],
  [LOAN_PRODUCT.CREDIT_CARD]: [
    DOCUMENT_TYPE.PAN,
    DOCUMENT_TYPE.AADHAAR,
    DOCUMENT_TYPE.SALARY_SLIP,
  ],
  [LOAN_PRODUCT.WORKING_CAPITAL]: [
    DOCUMENT_TYPE.PAN,
    DOCUMENT_TYPE.AADHAAR,
    DOCUMENT_TYPE.BANK_STATEMENT,
    DOCUMENT_TYPE.GST_RETURN,
    DOCUMENT_TYPE.ITR,
  ],
  [LOAN_PRODUCT.LAP]: [
    DOCUMENT_TYPE.PAN,
    DOCUMENT_TYPE.AADHAAR,
    DOCUMENT_TYPE.PROPERTY_DOCUMENT,
    DOCUMENT_TYPE.BANK_STATEMENT,
    DOCUMENT_TYPE.ITR,
  ],
  [LOAN_PRODUCT.HOME_LOAN]: [
    DOCUMENT_TYPE.PAN,
    DOCUMENT_TYPE.AADHAAR,
    DOCUMENT_TYPE.PROPERTY_DOCUMENT,
    DOCUMENT_TYPE.SALARY_SLIP,
    DOCUMENT_TYPE.BANK_STATEMENT,
  ],
};

export function getRequiredDocuments(loanType: LOAN_PRODUCT): LoanDocumentRequirement[] {
  const types = REQUIRED_DOCUMENTS_BY_LOAN_TYPE[loanType] || [];
  const requirements: LoanDocumentRequirement[] = [];
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    requirements.push({
      type,
      label: documentLabels[type],
    });
  }
  return requirements;
}

export function getRequiredDocumentTypes(loanType: LOAN_PRODUCT): DOCUMENT_TYPE[] {
  return REQUIRED_DOCUMENTS_BY_LOAN_TYPE[loanType] || [];
}
