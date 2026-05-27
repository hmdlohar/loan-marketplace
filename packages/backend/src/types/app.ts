import { Request, Response } from "express";
import { ICMSContext } from "./cms";

export interface IAuthTokenData {
  _id: string;
  Role: string;
  IsAdminUser?: boolean;
  FullName?: string;
  Email?: string;
  Access?: {
    [key: string]: any;
  };
}

export interface AppRequest<T = any> extends Request {
  context?: ICMSContext;
  User?: IAuthTokenData;
  body: T;
}

export interface AppResponse extends Response {
  TotalRowCount?: number | string;
}
