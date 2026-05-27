import { IRouteItem } from "@root/types/routingSystem";
import { IRPCFunctionDefinition } from "@root/types/rpc";

export function createController(
  collectionKey: string,
  coll: IRouteItem[]
): IRouteItem[] {
  return coll;
}

export function rpcItem(io: { route: string; definition: IRPCFunctionDefinition }) {
  return {
    route: io.route,
    method: "post",
    title: io.definition.title,
    bodyDTO: io.definition.argsSchema,
    returnDTO: io.definition.returnSchema,
    access: io.definition.access,
    callback: async ({ body, req }: { body: any; req: any }) => {
      if (!req.context) throw new Error(`Route ${io.route} cannot be called without context`);
      return await io.definition.callback(body, req.context);
    },
  } as IRouteItem;
}
