import { USER_ROLE } from "commonlib";
import { ICMSContext } from "@root/types/cms";
import UserService from "@root/api/user/UserService";

export async function getContextUser(context: ICMSContext) {
  if (!context.IsAuthenticated || !context.SystemUserID) {
    throw new Error("You must be logged in to access this resource.");
  }

  const user = await UserService.context(context).get(context.SystemUserID);
  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

export async function getPartnerIdsForUser(context: ICMSContext) {
  const user = await getContextUser(context);
  const partnerIds = user.Access?.PartnerIDs || [];

  if (user.Role === USER_ROLE.SYSTEM_ADMIN) {
    return null;
  }

  if (user.Role !== USER_ROLE.PARTNER) {
    throw new Error("Only partner users can access partner resources.");
  }

  if (!partnerIds.length) {
    throw new Error("No partner access assigned to this user.");
  }

  return partnerIds;
}

export async function assertPartnerAccess(context: ICMSContext, partnerId: string) {
  const user = await getContextUser(context);

  if (user.Role === USER_ROLE.SYSTEM_ADMIN) {
    return user;
  }

  const partnerIds = user.Access?.PartnerIDs || [];
  if (!partnerIds.includes(partnerId)) {
    throw new Error("You do not have access to this partner resource.");
  }

  return user;
}

export function getDefaultProductFormFields() {
  return [
    { Label: "Full Name", Type: "text", Required: true },
    { Label: "Email", Type: "email", Required: true },
    { Label: "Mobile", Type: "tel", Required: true },
  ];
}
