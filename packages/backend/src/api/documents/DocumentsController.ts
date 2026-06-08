import ListDefinition from "./fns/List";
import UploadDefinition from "./fns/Upload";
import { DocumentsCollectionKey } from "./DocumentsSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(DocumentsCollectionKey, [
  rpcItem({
    route: "/List",
    definition: ListDefinition,
  }),
  rpcItem({
    route: "/Upload",
    definition: UploadDefinition,
  }),]);
