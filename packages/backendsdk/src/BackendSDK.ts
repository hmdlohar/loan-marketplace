import axios from "axios";
import * as types from "./types";

export interface ITHTResponse<T = any> {
  status: boolean;
  data: T;
  message: string;
}

export class BackendSDK {
  authToken?: string;
  rootURL: string;
  getAuthToken?: () => string | Promise<string>;

  constructor(io: {
    rootURL: string;
    authToken?: string;
    getAuthToken?: () => string | Promise<string>;
  }) {
    this.rootURL = io.rootURL;
    if (io.authToken) this.authToken = io.authToken;
    this.getAuthToken = io.getAuthToken;
  }

  async getToken() {
    if (this.getAuthToken) return this.getAuthToken();
    return this.authToken;
  }

  async cmsQuery(
    collectionKey: string,
    data: any,
    options?: {
      route?: string;
      method?: string;
      headers?: Record<string, string>;
      authToken?: string;
    }
  ) {
    const route = options?.route || "/";
    const method = options?.method || "post";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    const token = options?.authToken || (await this.getToken());
    if (token) {
      headers.Authorization = token;
    }

    const url = `${this.rootURL}/api/${collectionKey}${route}`;
    const response = await axios({
      url,
      headers,
      method: method.toUpperCase(),
      data: JSON.stringify(data),
    });

    return response?.data;
  }

  // Methods Start
  async CronLog_RunCronJob(
    args: types.ICronLog_RunCronJobArgs
  ): Promise<ITHTResponse<types.ICronLog_RunCronJobReturnType>> {
    return this.cmsQuery("cron-log", args, { method: "post", route: "/RunCronJob" });
  }
  async User_GetProfile(
    args: types.IUser_GetProfileArgs
  ): Promise<ITHTResponse<types.IUser_GetProfileReturnType>> {
    return this.cmsQuery("user", args, { method: "post", route: "/GetProfile" });
  }
  async User_Login(
    args: types.IUser_LoginArgs
  ): Promise<ITHTResponse<types.IUser_LoginReturnType>> {
    return this.cmsQuery("user", args, { method: "post", route: "/Login" });
  }
  async Partners_UploadLogo(
    args: types.IPartners_UploadLogoArgs
  ): Promise<ITHTResponse<types.IPartners_UploadLogoReturnType>> {
    return this.cmsQuery("partners", args, { method: "post", route: "/UploadLogo" });
  }
  async Partners_ConfirmLogo(
    args: types.IPartners_ConfirmLogoArgs
  ): Promise<ITHTResponse<types.IPartners_ConfirmLogoReturnType>> {
    return this.cmsQuery("partners", args, { method: "post", route: "/ConfirmLogo" });
  }
  async Partners_GetLogoUploadUrl(
    args: types.IPartners_GetLogoUploadUrlArgs
  ): Promise<ITHTResponse<types.IPartners_GetLogoUploadUrlReturnType>> {
    return this.cmsQuery("partners", args, { method: "post", route: "/GetLogoUploadUrl" });
  }
  async Partners_Get(
    args: types.IPartners_GetArgs
  ): Promise<ITHTResponse<types.IPartners_GetReturnType>> {
    return this.cmsQuery("partners", args, { method: "post", route: "/Get" });
  }
  async Partners_Update(
    args: types.IPartners_UpdateArgs
  ): Promise<ITHTResponse<types.IPartners_UpdateReturnType>> {
    return this.cmsQuery("partners", args, { method: "post", route: "/Update" });
  }
  async Partners_Create(
    args: types.IPartners_CreateArgs
  ): Promise<ITHTResponse<types.IPartners_CreateReturnType>> {
    return this.cmsQuery("partners", args, { method: "post", route: "/Create" });
  }
  async Partners_List(
    args: types.IPartners_ListArgs
  ): Promise<ITHTResponse<types.IPartners_ListReturnType>> {
    return this.cmsQuery("partners", args, { method: "post", route: "/List" });
  }
  async Products_Get(
    args: types.IProducts_GetArgs
  ): Promise<ITHTResponse<types.IProducts_GetReturnType>> {
    return this.cmsQuery("products", args, { method: "post", route: "/Get" });
  }
  async Products_Delete(
    args: types.IProducts_DeleteArgs
  ): Promise<ITHTResponse<types.IProducts_DeleteReturnType>> {
    return this.cmsQuery("products", args, { method: "post", route: "/Delete" });
  }
  async Products_Update(
    args: types.IProducts_UpdateArgs
  ): Promise<ITHTResponse<types.IProducts_UpdateReturnType>> {
    return this.cmsQuery("products", args, { method: "post", route: "/Update" });
  }
  async Products_Create(
    args: types.IProducts_CreateArgs
  ): Promise<ITHTResponse<types.IProducts_CreateReturnType>> {
    return this.cmsQuery("products", args, { method: "post", route: "/Create" });
  }
  async Products_List(
    args: types.IProducts_ListArgs
  ): Promise<ITHTResponse<types.IProducts_ListReturnType>> {
    return this.cmsQuery("products", args, { method: "post", route: "/List" });
  }

  // Methods End
}
