import DeleteDefinition from "./fns/Delete";
import UpdateDefinition from "./fns/Update";
import GetDefinition from "./fns/Get";
import CreateDefinition from "./fns/Create";
import ListDefinition from "./fns/List";
import { BanksCollectionKey } from "./BanksSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(BanksCollectionKey, [
  rpcItem({
    route: "/Delete",
    definition: DeleteDefinition,
  }),
  rpcItem({
    route: "/Update",
    definition: UpdateDefinition,
  }),
  rpcItem({
    route: "/Get",
    definition: GetDefinition,
  }),
  rpcItem({
    route: "/Create",
    definition: CreateDefinition,
  }),
  rpcItem({
    route: "/List",
    definition: ListDefinition,
  }),
]);
