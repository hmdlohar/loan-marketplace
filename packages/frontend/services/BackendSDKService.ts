import { BackendSDK } from "backendsdk";
import config from "../config";
import AuthServices from "./AuthServices";

export const bSdk = new BackendSDK({
  rootURL: config.ROOT_URL,
  getAuthToken: async () => {
    const token = AuthServices.getToken();
    if (!token) {
      return "";
    }
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  },
});
