import config from "../config";

/** Build a backend file-proxy URL from an S3 object key (e.g. public/lender-logos/abc.svg). */
export function getFileProxyUrl(key: string) {
  if (!key) {
    return "";
  }
  const baseUrl = config.ROOT_URL.replace(/\/$/, "");
  return `${baseUrl}/api/files/${key}`;
}
