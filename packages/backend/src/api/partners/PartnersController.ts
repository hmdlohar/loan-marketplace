import ConfirmLogoDefinition from "./fns/ConfirmLogo";
import UploadLogoDefinition from "./fns/UploadLogo";
import GetLogoUploadUrlDefinition from "./fns/GetLogoUploadUrl";
import GetDefinition from "./fns/Get";
import UpdateDefinition from "./fns/Update";
import CreateDefinition from "./fns/Create";
import ListDefinition from "./fns/List";
import { PartnersCollectionKey } from "./PartnersSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(PartnersCollectionKey, [
  rpcItem({
    route: "/UploadLogo",
    definition: UploadLogoDefinition,
  }),
  rpcItem({
    route: "/ConfirmLogo",
    definition: ConfirmLogoDefinition,
  }),
  rpcItem({
    route: "/GetLogoUploadUrl",
    definition: GetLogoUploadUrlDefinition,
  }),
  rpcItem({
    route: "/Get",
    definition: GetDefinition,
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
