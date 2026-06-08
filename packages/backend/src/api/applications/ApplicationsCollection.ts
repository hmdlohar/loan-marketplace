import { ICollectionDefinition } from "@root/types/collections";
import ApplicationsController from "./ApplicationsController";
import { ApplicationsSchema } from "./ApplicationsSchema";
import ApplicationsService from "./ApplicationsService";

const ApplicationsCollection: ICollectionDefinition = {
  key: "applications",
  controller: ApplicationsController,
  service: ApplicationsService,
  schema: ApplicationsSchema,
  type: "list",
};
export default ApplicationsCollection;
