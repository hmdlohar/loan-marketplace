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

  // Methods End
}
