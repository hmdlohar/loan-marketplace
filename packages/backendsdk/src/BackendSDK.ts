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
  async User_VerifyOtp(
    args: types.IUser_VerifyOtpArgs
  ): Promise<ITHTResponse<types.IUser_VerifyOtpReturnType>> {
    return this.cmsQuery("user", args, { method: "post", route: "/VerifyOtp" });
  }
  async User_SendOtp(
    args: types.IUser_SendOtpArgs
  ): Promise<ITHTResponse<types.IUser_SendOtpReturnType>> {
    return this.cmsQuery("user", args, { method: "post", route: "/SendOtp" });
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
  async Banks_Delete(
    args: types.IBanks_DeleteArgs
  ): Promise<ITHTResponse<types.IBanks_DeleteReturnType>> {
    return this.cmsQuery("banks", args, { method: "post", route: "/Delete" });
  }
  async Banks_Update(
    args: types.IBanks_UpdateArgs
  ): Promise<ITHTResponse<types.IBanks_UpdateReturnType>> {
    return this.cmsQuery("banks", args, { method: "post", route: "/Update" });
  }
  async Banks_Get(
    args: types.IBanks_GetArgs
  ): Promise<ITHTResponse<types.IBanks_GetReturnType>> {
    return this.cmsQuery("banks", args, { method: "post", route: "/Get" });
  }
  async Banks_Create(
    args: types.IBanks_CreateArgs
  ): Promise<ITHTResponse<types.IBanks_CreateReturnType>> {
    return this.cmsQuery("banks", args, { method: "post", route: "/Create" });
  }
  async Banks_List(
    args: types.IBanks_ListArgs
  ): Promise<ITHTResponse<types.IBanks_ListReturnType>> {
    return this.cmsQuery("banks", args, { method: "post", route: "/List" });
  }
  async Products_GetPublic(
    args: types.IProducts_GetPublicArgs
  ): Promise<ITHTResponse<types.IProducts_GetPublicReturnType>> {
    return this.cmsQuery("products", args, { method: "post", route: "/GetPublic" });
  }
  async Products_ListPublic(
    args: types.IProducts_ListPublicArgs
  ): Promise<ITHTResponse<types.IProducts_ListPublicReturnType>> {
    return this.cmsQuery("products", args, { method: "post", route: "/ListPublic" });
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
  async Products_Save(
    args: types.IProducts_SaveArgs
  ): Promise<ITHTResponse<types.IProducts_SaveReturnType>> {
    return this.cmsQuery("products", args, { method: "post", route: "/Save" });
  }
  async Products_List(
    args: types.IProducts_ListArgs
  ): Promise<ITHTResponse<types.IProducts_ListReturnType>> {
    return this.cmsQuery("products", args, { method: "post", route: "/List" });
  }
  async Customers_SaveProfile(
    args: types.ICustomers_SaveProfileArgs
  ): Promise<ITHTResponse<types.ICustomers_SaveProfileReturnType>> {
    return this.cmsQuery("customers", args, { method: "post", route: "/SaveProfile" });
  }
  async Customers_Get(
    args: types.ICustomers_GetArgs
  ): Promise<ITHTResponse<types.ICustomers_GetReturnType>> {
    return this.cmsQuery("customers", args, { method: "post", route: "/Get" });
  }
  async Customers_ListForAdmin(
    args: types.ICustomers_ListForAdminArgs
  ): Promise<ITHTResponse<types.ICustomers_ListForAdminReturnType>> {
    return this.cmsQuery("customers", args, { method: "post", route: "/ListForAdmin" });
  }
  async Applications_Get(
    args: types.IApplications_GetArgs
  ): Promise<ITHTResponse<types.IApplications_GetReturnType>> {
    return this.cmsQuery("applications", args, { method: "post", route: "/Get" });
  }
  async Applications_List(
    args: types.IApplications_ListArgs
  ): Promise<ITHTResponse<types.IApplications_ListReturnType>> {
    return this.cmsQuery("applications", args, { method: "post", route: "/List" });
  }
  async Applications_Save(
    args: types.IApplications_SaveArgs
  ): Promise<ITHTResponse<types.IApplications_SaveReturnType>> {
    return this.cmsQuery("applications", args, { method: "post", route: "/Save" });
  }
  async Applications_GetRecommendations(
    args: types.IApplications_GetRecommendationsArgs
  ): Promise<ITHTResponse<types.IApplications_GetRecommendationsReturnType>> {
    return this.cmsQuery("applications", args, { method: "post", route: "/GetRecommendations" });
  }
  async Applications_SelectProduct(
    args: types.IApplications_SelectProductArgs
  ): Promise<ITHTResponse<types.IApplications_SelectProductReturnType>> {
    return this.cmsQuery("applications", args, { method: "post", route: "/SelectProduct" });
  }
  async Documents_List(
    args: types.IDocuments_ListArgs
  ): Promise<ITHTResponse<types.IDocuments_ListReturnType>> {
    return this.cmsQuery("documents", args, { method: "post", route: "/List" });
  }
  async Documents_ListAdmin(
    args: types.IDocuments_ListAdminArgs
  ): Promise<ITHTResponse<types.IDocuments_ListAdminReturnType>> {
    return this.cmsQuery("documents", args, { method: "post", route: "/ListAdmin" });
  }
  async Documents_ParseAdmin(
    args: types.IDocuments_ParseAdminArgs
  ): Promise<ITHTResponse<types.IDocuments_ParseAdminReturnType>> {
    return this.cmsQuery("documents", args, { method: "post", route: "/ParseAdmin" });
  }
  async Documents_DeleteAdmin(
    args: types.IDocuments_DeleteAdminArgs
  ): Promise<ITHTResponse<types.IDocuments_DeleteAdminReturnType>> {
    return this.cmsQuery("documents", args, { method: "post", route: "/DeleteAdmin" });
  }
  async Documents_Upload(
    args: types.IDocuments_UploadArgs
  ): Promise<ITHTResponse<types.IDocuments_UploadReturnType>> {
    return this.cmsQuery("documents", args, { method: "post", route: "/Upload" });
  }
  async Documents_UploadVault(
    args: types.IDocuments_UploadVaultArgs
  ): Promise<ITHTResponse<types.IDocuments_UploadVaultReturnType>> {
    return this.cmsQuery("documents", args, { method: "post", route: "/UploadVault" });
  }
  async Documents_ListVault(
    args: types.IDocuments_ListVaultArgs
  ): Promise<ITHTResponse<types.IDocuments_ListVaultReturnType>> {
    return this.cmsQuery("documents", args, { method: "post", route: "/ListVault" });
  }
  async Documents_Parse(
    args: types.IDocuments_ParseArgs
  ): Promise<ITHTResponse<types.IDocuments_ParseReturnType>> {
    return this.cmsQuery("documents", args, { method: "post", route: "/Parse" });
  }
  async Documents_AttachToApplication(
    args: types.IDocuments_AttachToApplicationArgs
  ): Promise<ITHTResponse<types.IDocuments_AttachToApplicationReturnType>> {
    return this.cmsQuery("documents", args, { method: "post", route: "/AttachToApplication" });
  }

  // Methods End
}
