export interface IBaseProducts {
  CreatedAt: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
  CreatedBy?: string;
  _id?: string;
  Title: string;
  Slug: string;
  ShortDescription: string;
  LongDescription: string;
  LoanType: string;
  PartnerID: string;
  MainImage?: string;
  FormFields?: {
    Label: string;
    Type: string;
    Required: boolean;
  }[];
}
