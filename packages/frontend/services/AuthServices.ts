import { USER_ROLE } from "commonlib";
import { clearAllCaches } from "./ReactQueryClient";
import { LocalStorageUtils } from "../utils/localStorageUtils";

const AUTH_TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";

const AUTH_FAILURE_PATTERNS = [
  "logged in",
  "not allowed to access",
  "user not found",
  "jwt expired",
  "invalid token",
  "token expired",
];

let sessionValidated = false;

export type AuthUserData = {
  _id: string;
  Email: string;
  Mobile: string;
  FullName: string;
  Role: string;
  Access?: {
    PartnerIDs?: string[];
    CustomerID?: string;
  };
};

class AuthServices {
  static setToken(token: string | null) {
    LocalStorageUtils.lsSet(AUTH_TOKEN_KEY, token);
  }

  static markSessionValidated() {
    sessionValidated = true;
  }

  static isSessionValidated() {
    return sessionValidated;
  }

  static isAuthFailureMessage(message?: string) {
    if (!message) {
      return false;
    }
    const normalized = message.toLowerCase();
    for (let i = 0; i < AUTH_FAILURE_PATTERNS.length; i++) {
      if (normalized.includes(AUTH_FAILURE_PATTERNS[i])) {
        return true;
      }
    }
    return false;
  }

  static isAuthFailureResponse(response?: { status?: boolean; message?: string }) {
    if (!response || response.status) {
      return false;
    }
    return AuthServices.isAuthFailureMessage(response.message);
  }

  static isAuthFailureError(ex: any) {
    const status = ex?.response?.status;
    if (status === 401 || status === 403) {
      return true;
    }
    const message = ex?.response?.data?.message || ex?.message;
    return AuthServices.isAuthFailureMessage(message);
  }

  static getToken() {
    return LocalStorageUtils.lsGet(AUTH_TOKEN_KEY) as string | null;
  }

  static setUserData(user: AuthUserData | null) {
    LocalStorageUtils.lsSet(USER_DATA_KEY, user);
  }

  static getUserData(): AuthUserData | null {
    if (!AuthServices.getToken()) return null;
    return LocalStorageUtils.lsGet(USER_DATA_KEY) as AuthUserData | null;
  }

  static onLogout() {
    sessionValidated = false;
    AuthServices.setToken(null);
    LocalStorageUtils.lsDelete(USER_DATA_KEY);
    clearAllCaches();
  }

  static isAuthenticated() {
    return !!AuthServices.getToken();
  }

  static getRole() {
    const userData = AuthServices.getUserData();
    if (!userData) return USER_ROLE.NONE;
    return userData.Role || USER_ROLE.CUSTOMER;
  }

  static isSystemAdmin() {
    return AuthServices.getRole() === USER_ROLE.SYSTEM_ADMIN;
  }

  static isPartner() {
    return AuthServices.getRole() === USER_ROLE.PARTNER;
  }

  static getDefaultRoute() {
    if (AuthServices.isSystemAdmin()) {
      return "/admin/partners";
    }
    if (AuthServices.isPartner()) {
      return "/partner/products";
    }
    return "/app/dashboard";
  }
}

export default AuthServices;
