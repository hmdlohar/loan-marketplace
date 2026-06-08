import SaveProfileDefinition from "./fns/SaveProfile";
import GetDefinition from "./fns/Get";
import { CustomersCollectionKey } from "./CustomersSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(CustomersCollectionKey, [
  rpcItem({
    route: "/SaveProfile",
    definition: SaveProfileDefinition,
  }),
  rpcItem({
    route: "/Get",
    definition: GetDefinition,
  }),]);
