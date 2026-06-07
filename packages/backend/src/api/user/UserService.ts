import { BaseService, serviceWithContext } from "@lib/BaseService";
import { IUser, UserCollectionKey } from "./UserSchema";
import { ICMSContext } from "@root/types/cms";

class UserServiceClass extends BaseService<IUser> {
  constructor(context: ICMSContext) {
    super(UserCollectionKey, context);
  }
}

const UserService = serviceWithContext<UserServiceClass>(UserServiceClass);
export default UserService;
export { UserServiceClass };
