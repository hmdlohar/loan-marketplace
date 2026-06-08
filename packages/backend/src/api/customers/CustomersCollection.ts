import { ICollectionDefinition } from "@root/types/collections";
import CustomersController from "./CustomersController";
import { CustomersSchema } from "./CustomersSchema";
import CustomersService from "./CustomersService";

const CustomersCollection: ICollectionDefinition = {
  key: "customers",
  controller: CustomersController,
  service: CustomersService,
  schema: CustomersSchema,
  type: "list",
};
export default CustomersCollection;
