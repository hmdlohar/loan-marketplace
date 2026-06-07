import GetDefinition from "./fns/Get";
import DeleteDefinition from "./fns/Delete";
import UpdateDefinition from "./fns/Update";
import CreateDefinition from "./fns/Create";
import ListDefinition from "./fns/List";
import { ProductsCollectionKey } from "./ProductsSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(ProductsCollectionKey, [
  rpcItem({
    route: "/Get",
    definition: GetDefinition,
  }),
  rpcItem({
    route: "/Delete",
    definition: DeleteDefinition,
  }),
  rpcItem({
    route: "/Update",
    definition: UpdateDefinition,
  }),
  rpcItem({
    route: "/Create",
    definition: CreateDefinition,
  }),
  rpcItem({
    route: "/List",
    definition: ListDefinition,
  }),]);
