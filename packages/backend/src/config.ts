import dotenv from "dotenv";
import { USER_ROLE } from "commonlib";
dotenv.config();

export default {
  PORT: process.env.PORT || 4000,
  MONGODB_URL: process.env.MONGODB_URL || "mongodb://localhost:27017/loan-marketplace",
  JWT_TOKEN: process.env.JWT_TOKEN || "loan-marketplace-super-secret-key-2026",
  ENABLE_CRON: process.env.ENABLE_CRON === "true",
  DEFAULT_RESOURCE_ACCESS: {
    allow: [USER_ROLE.SYSTEM_ADMIN]
  }
};
