import GetPublicDefinition from "./fns/GetPublic";
import ListPublicDefinition from "./fns/ListPublic";
import GetDefinition from "./fns/Get";
import DeleteDefinition from "./fns/Delete";
import SaveDefinition from "./fns/Save";
import ListDefinition from "./fns/List";
import { ProductsCollectionKey } from "./ProductsSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(ProductsCollectionKey, [
  rpcItem({
    route: "/GetPublic",
    definition: GetPublicDefinition,
  }),
  rpcItem({
    route: "/ListPublic",
    definition: ListPublicDefinition,
  }),
  rpcItem({
    route: "/Get",
    definition: GetDefinition,
  }),
  rpcItem({
    route: "/Delete",
    definition: DeleteDefinition,
  }),
  rpcItem({
    route: "/Save",
    definition: SaveDefinition,
  }),
  rpcItem({
    route: "/List",
    definition: ListDefinition,
  }),
]);
