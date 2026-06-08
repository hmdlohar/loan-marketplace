export type ICollectionKeys = "cron-log" | "user" | "partners" | "banks" | "products";

export type ICronLog_RunCronJobArgs = {

};

export type ICronLog_RunCronJobReturnType = any;
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
