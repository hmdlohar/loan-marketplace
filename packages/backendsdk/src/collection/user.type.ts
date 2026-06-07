export interface IBaseUser {
  CreatedAt: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
  CreatedBy?: string;
  _id?: string;
  Email: string;
  PasswordHash: string;
  Mobile: string;
  FullName: string;
  Role?: string;
  Access?: {
    PartnerIDs?: any[];
    CustomerID?: string;
  };
}
