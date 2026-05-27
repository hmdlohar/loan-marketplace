import { AppRequest, AppResponse } from "./app";

export interface IAccessRights {
  allow: string[];
  create?: string[];
  read?: string[];
  update?: string[];
  delete?: string[];
}

export interface IRouteItem {
  isDefault?: boolean;
  route: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  title?: string;
  bodyDTO?: any;
  queryDTO?: any;
  access?: IAccessRights;
  collectionKey?: string;
  disableResponse?: boolean;
  callback: (io: { req: AppRequest; res: AppResponse; body: any }) => Promise<any>;
}
export type IAccessOperation = "allow" | "create" | "read" | "update" | "delete";
