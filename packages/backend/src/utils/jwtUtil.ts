import config from "@root/config";
import jwt from "jsonwebtoken";
import { USER_ROLE } from "commonlib";
import { IUser } from "@root/api/user/UserSchema";

export function signUserToken(user: IUser) {
  const role = user.Role || USER_ROLE.CUSTOMER;
  const isAdminUser = role === USER_ROLE.SYSTEM_ADMIN;

  return jwt.sign(
    {
      _id: user._id,
      Role: role,
      IsAdminUser: isAdminUser,
      FullName: user.FullName,
      Email: user.Email,
    },
    config.JWT_TOKEN,
    { expiresIn: "7d" }
  );
}

export function toPublicUser(user: IUser) {
  return {
    _id: user._id,
    Email: user.Email,
    Mobile: user.Mobile,
    FullName: user.FullName,
    Role: user.Role || USER_ROLE.CUSTOMER,
    Access: user.Access,
  };
}
