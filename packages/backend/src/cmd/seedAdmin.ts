import config from "@root/config";
import { initMongo } from "@lib/initMongo";
import { USER_ROLE } from "commonlib";
import UserService from "@root/api/user/UserService";
import { hashPassword } from "@root/utils/passwordUtil";

async function seedAdmin() {
  await initMongo();

  const email = config.SEED_ADMIN_EMAIL;
  const password = config.SEED_ADMIN_PASSWORD;
  const mobile = config.SEED_ADMIN_MOBILE;
  const fullName = config.SEED_ADMIN_FULL_NAME;

  if (!email || !password || !mobile) {
    throw new Error("Set SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, and SEED_ADMIN_MOBILE in environment.");
  }

  const existingAdmin = await UserService.context("SYSTEM").findOne({ Role: USER_ROLE.SYSTEM_ADMIN });
  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.Email}`);
    process.exit(0);
  }

  const existingEmail = await UserService.context("SYSTEM").findOne({ Email: email.toLowerCase().trim() });
  if (existingEmail) {
    throw new Error(`User with email ${email} already exists.`);
  }

  const passwordHash = await hashPassword(password);
  const admin = await UserService.context("SYSTEM").create({
    Email: email.toLowerCase().trim(),
    PasswordHash: passwordHash,
    Mobile: mobile,
    FullName: fullName,
    Role: USER_ROLE.SYSTEM_ADMIN,
  });

  console.log(`Created system admin: ${admin.Email} (${admin._id})`);
  process.exit(0);
}

seedAdmin().catch((ex) => {
  console.error(ex.message || ex);
  process.exit(1);
});
