import { ICollectionDefinition } from "@root/types/collections";
import UserController from "./UserController";
import { UserSchema } from "./UserSchema";
import UserService from "./UserService";

const UserCollection: ICollectionDefinition = {
  key: "user",
  controller: UserController,
  service: UserService,
  schema: UserSchema,
  type: "list",
};
export default UserCollection;
