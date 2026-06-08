import dotenv from "dotenv";
import { USER_ROLE } from "commonlib";
dotenv.config();

export default {
  PORT: process.env.PORT || 4000,
  MONGODB_URL: process.env.MONGODB_URL || "mongodb://localhost:27017/loan-marketplace",
  JWT_TOKEN: process.env.JWT_TOKEN || "loan-marketplace-super-secret-key-2026",
  ENABLE_CRON: process.env.ENABLE_CRON === "true",
  DEFAULT_RESOURCE_ACCESS: {
    allow: [USER_ROLE.SYSTEM_ADMIN],
  },
  AWS_REGION: process.env.AWS_REGION || "ap-south-1",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  AWS_S3_ENDPOINT: process.env.AWS_S3_ENDPOINT || "",
  AWS_S3_FORCE_PATH_STYLE: process.env.AWS_S3_FORCE_PATH_STYLE !== "false",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:4000",
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || "",
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || "",
  SEED_ADMIN_MOBILE: process.env.SEED_ADMIN_MOBILE || "",
  SEED_ADMIN_FULL_NAME: process.env.SEED_ADMIN_FULL_NAME || "System Admin",
  SEED_PARTNER_ID: process.env.SEED_PARTNER_ID || "",
  MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY || "",
  MSG91_SENDER_ID: process.env.MSG91_SENDER_ID || "",
  MSG91_OTP_EXPIRY_MINUTES: Number(process.env.MSG91_OTP_EXPIRY_MINUTES || 10),
  MSG91_OTP_LENGTH: Number(process.env.MSG91_OTP_LENGTH || 6),
  MSG91_OTP_DEV_MODE: process.env.MSG91_OTP_DEV_MODE === "true",
  MSG91_OTP_DEV_CODE: process.env.MSG91_OTP_DEV_CODE || "123456",
};
