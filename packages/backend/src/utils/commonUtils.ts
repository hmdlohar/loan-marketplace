import { Types } from "mongoose";

export function createOIdString(): string {
  return new Types.ObjectId().toString();
}

export function getFullName(user?: any) {
  if (!user) return "Default User";
  if (user.FullName) return user.FullName;
  return `${user.FirstName || ""} ${user.LastName || ""}`.trim() || "Default User";
}
