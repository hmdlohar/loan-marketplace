import { BaseService, serviceWithContext } from "@lib/BaseService";
import { ICustomers, CustomersCollectionKey } from "./CustomersSchema";
import { ICMSContext } from "@root/types/cms";

class CustomersServiceClass extends BaseService<ICustomers> {
  constructor(context: ICMSContext) {
    super(CustomersCollectionKey, context);
  }
}

const CustomersService = serviceWithContext<CustomersServiceClass>(CustomersServiceClass);
export default CustomersService;
export { CustomersServiceClass };
