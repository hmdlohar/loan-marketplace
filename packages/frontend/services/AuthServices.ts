import { clearAllCaches } from "./ReactQueryClient";
import { LocalStorageUtils } from "../utils/localStorageUtils";

const AUTH_TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";

class AuthServices {
  static setToken(token: string | null) {
    LocalStorageUtils.lsSet(AUTH_TOKEN_KEY, token);
  }

  static getToken() {
    return LocalStorageUtils.lsGet(AUTH_TOKEN_KEY) as string | null;
  }

  static setUserData(user: any) {
    LocalStorageUtils.lsSet(USER_DATA_KEY, user);
  }

  static getUserData() {
    if (!AuthServices.getToken()) return null;
    return LocalStorageUtils.lsGet(USER_DATA_KEY);
  }

  static onLogout() {
    AuthServices.setToken(null);
    LocalStorageUtils.lsDelete(USER_DATA_KEY);
    clearAllCaches();
  }

  static isAuthenticated() {
    return !!AuthServices.getToken();
  }
}

export default AuthServices;
