export interface IBaseCustomers {
  CreatedAt: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
  CreatedBy?: string;
  _id?: string;
  UserID: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  FullName?: string;
  Email?: string;
  Mobile: string;
  DOB?: string;
  Gender?: string;
  PANNumber?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  PinCode?: string;
  City?: string;
  State?: string;
  EmploymentType?: string;
  NetIncome?: number;
}
