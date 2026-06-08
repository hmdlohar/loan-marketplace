export interface IBaseProducts {
  CreatedAt: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
  CreatedBy?: string;
  _id?: string;
  Title: string;
  Slug: string;
  ShortDescription: string;
  KeyBenefits?: any[];
  LoanType: string;
  BankID: string;
  PartnerID: string;
  FormFields?: {
    Key: string;
    Label: string;
    Type: string;
    Section?: string;
    Required: boolean;
    Placeholder?: string;
    Options?: any[];
    Validation?: {
      min?: number;
      max?: number;
      minAge?: number;
      maxAge?: number;
      errorMessage?: string;
    };
  }[];
}
