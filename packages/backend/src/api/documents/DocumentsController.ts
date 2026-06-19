import ListDefinition from "./fns/List";
import ListAdminDefinition from "./fns/ListAdmin";
import ParseAdminDefinition from "./fns/ParseAdmin";
import DeleteAdminDefinition from "./fns/DeleteAdmin";
import UploadDefinition from "./fns/Upload";
import UploadVaultDefinition from "./fns/UploadVault";
import ListVaultDefinition from "./fns/ListVault";
import ParseDefinition from "./fns/Parse";
import AttachToApplicationDefinition from "./fns/AttachToApplication";
import { DocumentsCollectionKey } from "./DocumentsSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(DocumentsCollectionKey, [
  rpcItem({
    route: "/List",
    definition: ListDefinition,
  }),
  rpcItem({
    route: "/ListAdmin",
    definition: ListAdminDefinition,
  }),
  rpcItem({
    route: "/ParseAdmin",
    definition: ParseAdminDefinition,
  }),
  rpcItem({
    route: "/DeleteAdmin",
    definition: DeleteAdminDefinition,
  }),
  rpcItem({
    route: "/Upload",
    definition: UploadDefinition,
  }),
  rpcItem({
    route: "/UploadVault",
    definition: UploadVaultDefinition,
  }),
  rpcItem({
    route: "/ListVault",
    definition: ListVaultDefinition,
  }),
  rpcItem({
    route: "/Parse",
    definition: ParseDefinition,
  }),
  rpcItem({
    route: "/AttachToApplication",
    definition: AttachToApplicationDefinition,
  }),
]);
