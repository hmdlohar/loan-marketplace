import config from "@root/config";
import { AppRequest, AppResponse } from "@root/types/app";
import { UnknownUserContext } from "@root/types/cms";
import { getFullName } from "@root/utils/commonUtils";
import jwt from "jsonwebtoken";

export default async function authDecode(req: AppRequest, res: AppResponse, next: any) {
  let token = req.headers.authorization || req.query.token?.toString();
  
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  if (token) {
    try {
      let decodedToken = await jwt.verify(token, config.JWT_TOKEN);
      if ((decodedToken as any)?._id) {
        req.User = {
          _id: (decodedToken as any)._id,
          Role: (decodedToken as any).Role || "CUSTOMER",
          IsAdminUser: (decodedToken as any).IsAdminUser || false,
          FullName: (decodedToken as any).FullName || "",
          Email: (decodedToken as any).Email || "",
        };
      }
    } catch (ex) {
      // Ignore invalid/expired tokens — treat the request as public unless the route requires auth.
    }
  }

  let ip = (req.headers["x-real-ip"] || req.ip || "127.0.0.1") as string;
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  if (req.User?._id) {
    req.context = {
      SystemUserID: req.User._id,
      IsAdmin: req.User.IsAdminUser || false,
      IsAuthenticated: true,
      req,
      res,
      token,
      FullName: getFullName(req.User),
      ClientPublicIP: ip,
    };
  } else {
    req.context = {
      ...UnknownUserContext,
      token,
      req,
      res,
      ClientPublicIP: ip,
    };
  }
  next();
}
