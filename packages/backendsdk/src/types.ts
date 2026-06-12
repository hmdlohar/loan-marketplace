export type ICollectionKeys = "cron-log" | "user" | "partners" | "banks" | "products" | "customers" | "applications" | "documents";

export type ICronLog_RunCronJobArgs = {

};

export type ICronLog_RunCronJobReturnType = any;
export type IUser_VerifyOtpArgs = {
  Mobile?: string;
  Otp?: string;
  FullName?: string;
};

export type IUser_VerifyOtpReturnType = any;
export type IUser_SendOtpArgs = {
  Mobile?: string;
};

export type IUser_SendOtpReturnType = any;
export type IUser_GetProfileArgs = {

};

export type IUser_GetProfileReturnType = any;
export type IUser_LoginArgs = {
  Email?: string;
  Password?: string;
};

export type IUser_LoginReturnType = any;
export type IPartners_UploadLogoArgs = {
  PartnerID?: string;
  ContentType?: string;
  FileBase64?: string;
};

export type IPartners_UploadLogoReturnType = any;
export type IPartners_ConfirmLogoArgs = {
  PartnerID?: string;
};

export type IPartners_ConfirmLogoReturnType = any;
export type IPartners_GetLogoUploadUrlArgs = {
  PartnerID?: string;
};

export type IPartners_GetLogoUploadUrlReturnType = any;
export type IPartners_GetArgs = {
  _id?: string;
};

export type IPartners_GetReturnType = any;
export type IPartners_UpdateArgs = {
  _id?: string;
  Name?: string;
  FullName?: string;
  Email?: string;
  Mobile?: string;
  Password?: string;
};

export type IPartners_UpdateReturnType = any;
export type IPartners_CreateArgs = {
  Name?: string;
  Email?: string;
  Password?: string;
  Mobile?: string;
  FullName?: string;
};

export type IPartners_CreateReturnType = any;
export type IPartners_ListArgs = {
  page?: number;
  pageSize?: number;
};

export type IPartners_ListReturnType = any;
export type IBanks_DeleteArgs = {
  _id?: string;
};

export type IBanks_DeleteReturnType = any;
export type IBanks_UpdateArgs = {
  _id?: string;
  Name?: string;
  LogoPath?: string;
};

export type IBanks_UpdateReturnType = any;
export type IBanks_GetArgs = {
  _id?: string;
};

export type IBanks_GetReturnType = any;
export type IBanks_CreateArgs = {
  Name?: string;
  LogoPath?: string;
};

export type IBanks_CreateReturnType = any;
export type IBanks_ListArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type IBanks_ListReturnType = any;
export type IProducts_GetPublicArgs = {
  slug?: string;
  _id?: string;
};

export type IProducts_GetPublicReturnType = any;
export type IProducts_ListPublicArgs = {
  page?: number;
  pageSize?: number;
  loanType?: string;
  search?: string;
};

export type IProducts_ListPublicReturnType = any;
export type IProducts_GetArgs = {
  _id?: string;
};

export type IProducts_GetReturnType = any;
export type IProducts_DeleteArgs = {
  _id?: string;
};

export type IProducts_DeleteReturnType = any;
export type IProducts_SaveArgs = {
  _id?: string;
  Title?: string;
  ShortDescription?: string;
  KeyBenefits?: string[];
  LoanType?: string;
  BankID?: string;
  FormFields?: {
    Key?: string;
    Label?: string;
    Type?: string;
    Section?: string;
    Required?: boolean;
    Placeholder?: string;
    Options?: string[];
    Validation?: {
      min?: number;
      max?: number;
      minAge?: number;
      maxAge?: number;
      errorMessage?: string;
    };
  }[];
};

export type IProducts_SaveReturnType = any;
export type IProducts_ListArgs = {
  page?: number;
  pageSize?: number;
};

export type IProducts_ListReturnType = any;
export type ICustomers_SaveProfileArgs = {
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  FullName?: string;
  Email?: string;
  Mobile?: string;
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
};

export type ICustomers_SaveProfileReturnType = any;
export type ICustomers_GetArgs = {

};

export type ICustomers_GetReturnType = any;
export type IApplications_GetArgs = {
  _id?: string;
};

export type IApplications_GetReturnType = any;
export type IApplications_ListArgs = {
  page?: number;
  pageSize?: number;
};

export type IApplications_ListReturnType = any;
export type IApplications_SaveArgs = {
  _id?: string;
  LoanType?: string;
  ProductID?: string;
  FormData?: {

  };
  Status?: string;
  DocumentIDs?: {
    PAN?: string;
    AADHAAR?: string;
    SALARY_SLIP?: string;
    BANK_STATEMENT?: string;
    ITR?: string;
    GST_RETURN?: string;
    PROPERTY_DOCUMENT?: string;
  };
};

export type IApplications_SaveReturnType = any;
export type IApplications_GetRecommendationsArgs = {
  ApplicationID?: string;
};

export type IApplications_GetRecommendationsReturnType = any;
export type IApplications_SelectProductArgs = {
  ApplicationID?: string;
  ProductID?: string;
};

export type IApplications_SelectProductReturnType = any;
export type IDocuments_ListArgs = {
  ApplicationID?: string;
};

export type IDocuments_ListReturnType = any;
export type IDocuments_UploadArgs = {
  ApplicationID?: string;
  DocumentType?: string;
  Name?: string;
  FileBase64?: string;
  ContentType?: string;
};

export type IDocuments_UploadReturnType = any;
export type IDocuments_UploadVaultArgs = {
  DocumentType?: string;
  Name?: string;
  FileBase64?: string;
  ContentType?: string;
};

export type IDocuments_UploadVaultReturnType = any;
export type IDocuments_ListVaultArgs = {

};

export type IDocuments_ListVaultReturnType = any;
export type IDocuments_ParseArgs = {
  DocumentID?: string;
};

export type IDocuments_ParseReturnType = any;
export type IDocuments_AttachToApplicationArgs = {
  ApplicationID?: string;
  DocumentID?: string;
};

export type IDocuments_AttachToApplicationReturnType = any;
