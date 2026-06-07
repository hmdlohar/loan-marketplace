import { ICollectionDefinition } from "@root/types/collections";
import PartnersController from "./PartnersController";
import { PartnersSchema } from "./PartnersSchema";
import PartnersService from "./PartnersService";

const PartnersCollection: ICollectionDefinition = {
  key: "partners",
  controller: PartnersController,
  service: PartnersService,
  schema: PartnersSchema,
  type: "list",
};
export default PartnersCollection;
