import config from "../config";
import AuthServices from "./AuthServices";

/** Build a backend file-proxy URL from an S3 object key (e.g. public/lender-logos/abc.svg). */
export function getFileProxyUrl(key: string) {
  if (!key) {
    return "";
  }
  const baseUrl = config.ROOT_URL.replace(/\/$/, "");
  return `${baseUrl}/api/files/${key}`;
}

export function getAuthenticatedFileUrl(path?: string) {
  if (!path) {
    return "";
  }
  const token = AuthServices.getToken();
  const url = getFileProxyUrl(path);
  if (!token) {
    return url;
  }
  return `${url}?token=${encodeURIComponent(token)}`;
}

export function isImageDocumentName(name?: string) {
  if (!name) {
    return false;
  }
  return /\.(jpe?g|png|webp|gif)$/i.test(name);
}

export function isPdfDocumentName(name?: string) {
  if (!name) {
    return false;
  }
  return /\.pdf$/i.test(name);
}
