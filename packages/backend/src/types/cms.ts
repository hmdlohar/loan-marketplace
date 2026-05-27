import { AppRequest, AppResponse } from "./app";

export interface IDataModifierProperty {
  CreatedAt: string;
  ModifiedAt?: string;
  CreatedBy?: string;
  ModifiedBy?: string;
}

export interface IPacket<T> {
  req: AppRequest<T>;
  res: AppResponse;
  result?: any;
}

export interface IRequestQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  sortOrder?: string;
  includeCount?: boolean;
  filter?: { [key: string]: any };
  project?: Record<string, any>;
  search?: string;
}

export interface IContextOptions {
  maintainHistory?: boolean;
  defaultCtxOptions?: IContextOptions;
  history?: {
    Comment?: string;
    Context?: any;
  };
}

export interface ICMSContext {
  req?: AppRequest;
  res?: AppResponse;
  SystemUserID: string;
  IsAdmin: boolean;
  IsAuthenticated: boolean;
  token?: string;
  FullName: string;
  options?: IContextOptions;
  ClientPublicIP?: string;
}

export const DefaultContext: ICMSContext = {
  SystemUserID: "DEFAULT",
  IsAdmin: false,
  IsAuthenticated: false,
  FullName: "Default User",
};

export const SystemContext: ICMSContext = {
  SystemUserID: "SYSTEM",
  IsAdmin: true,
  IsAuthenticated: true,
  FullName: "System",
};

export const UnknownUserContext: ICMSContext = {
  SystemUserID: "UNKNOWN",
  IsAdmin: false,
  IsAuthenticated: false,
  FullName: "Unknown User",
};

export type ICMSContextValue = ICMSContext | "SYSTEM";
