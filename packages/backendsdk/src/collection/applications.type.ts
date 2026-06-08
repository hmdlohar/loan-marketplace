export interface IBaseApplications {
  CreatedAt: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
  CreatedBy?: string;
  _id?: string;
  UserID: string;
  CustomerID?: string;
  ProductID: string;
  Status: string;
  FormData?: any;
  DocumentIDs?: {
    PAN?: string;
    AADHAAR?: string;
    SALARY_SLIP?: string;
    BANK_STATEMENT?: string;
    ITR?: string;
    GST_RETURN?: string;
    PROPERTY_DOCUMENT?: string;
  };
}
