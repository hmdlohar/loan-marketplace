import { USER_ROLE } from "commonlib";
import { AppRequest } from "@root/types/app";
import { IRouteItem } from "@root/types/routingSystem";
import { getCollection } from "@lib/cms";
import config from "@root/config";

export function isRole(user: any, role: string | string[]): boolean {
  if (!user) return false;
  if (typeof role === "string") {
    role = [role];
  }
  return role.includes(user.Role);
}

export function validateAccess(routeItem: IRouteItem, req: AppRequest) {
  let accessRoles = routeItem.access;
  if (!accessRoles && routeItem.collectionKey) {
    let collection = getCollection(routeItem.collectionKey);
    accessRoles = collection.access;
  }
  if (!accessRoles) accessRoles = config.DEFAULT_RESOURCE_ACCESS;

  if (accessRoles) {
    if (accessRoles.allow?.includes(USER_ROLE.NONE)) {
      throw new Error("This resource is not accessible by anyone");
    }

    if (accessRoles.allow?.includes(USER_ROLE.PUBLIC)) {
      return;
    }

    if (!req.User) throw new Error("You must be logged in to access this resource.");

    if (accessRoles.allow?.includes(USER_ROLE.AUTHENTICATED)) {
      return;
    }

    if (accessRoles.allow?.includes(req.User.Role as any) || req.User.IsAdminUser) {
      return;
    } else {
      throw new Error(`Your role ${req.User.Role} is not allowed to access this resource.`);
    }
  }
}
