import GetProfileDefinition from "./fns/GetProfile";
import LoginDefinition from "./fns/Login";
import { UserCollectionKey } from "./UserSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(UserCollectionKey, [
  rpcItem({
    route: "/GetProfile",
    definition: GetProfileDefinition,
  }),
  rpcItem({
    route: "/Login",
    definition: LoginDefinition,
  }),]);
