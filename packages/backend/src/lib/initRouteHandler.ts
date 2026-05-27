import { AppRequest, AppResponse } from "@root/types/app";
import { validateAccess } from "@root/utils/roleUtil";
import { Express } from "express";
import { IRouteItem } from "@root/types/routingSystem";
import { getController } from "./cms";

export function addRouteHandler(routeItem: IRouteItem, app: Express) {
  app[routeItem.method](routeItem.route, async (req: AppRequest, res: AppResponse) => {
    try {
      if (routeItem.method !== "get" && routeItem.bodyDTO) {
        if (typeof routeItem.bodyDTO?.validate === "function") {
          req.body = await routeItem.bodyDTO.validate(req.body, { stripUnknown: true });
        }
      }
      if (routeItem.queryDTO) {
        if (typeof routeItem.queryDTO?.validate === "function") {
          req.query = await routeItem.queryDTO.validate(req.query, { stripUnknown: true });
        }
      }

      validateAccess(routeItem, req);

      let result = await routeItem.callback({ req, res, body: req.body });
      
      if (!routeItem.disableResponse) {
        let resData = result && result.status !== undefined && result.hasOwnProperty("data") 
          ? result 
          : { status: true, data: result, message: "Success" };
          
        res.send(resData);
      }
    } catch (ex: any) {
      res.status(400).send({ status: false, message: ex.message || ex.toString() });
    }
  });
}

export function populateCollectionRoutes(collections: Record<string, any>, app: Express) {
  for (let key in collections) {
    try {
      let ctrl = getController(key);
      for (let routeItem of ctrl) {
        routeItem.collectionKey = key;
        addRouteHandler(
          {
            ...routeItem,
            route: `/api/${key}${routeItem.route}`,
          },
          app
        );
      }
    } catch (ex) {
      console.log("Could not add route for collection: ", key, ex);
    }
  }
}
