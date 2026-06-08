import GetDefinition from "./fns/Get";
import ListDefinition from "./fns/List";
import SaveDefinition from "./fns/Save";
import { ApplicationsCollectionKey } from "./ApplicationsSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(ApplicationsCollectionKey, [
  rpcItem({
    route: "/Get",
    definition: GetDefinition,
  }),
  rpcItem({
    route: "/List",
    definition: ListDefinition,
  }),
  rpcItem({
    route: "/Save",
    definition: SaveDefinition,
  }),]);
