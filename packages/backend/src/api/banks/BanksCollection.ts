import { ICollectionDefinition } from "@root/types/collections";
import BanksController from "./BanksController";
import { BanksSchema } from "./BanksSchema";
import BanksService from "./BanksService";

const BanksCollection: ICollectionDefinition = {
  key: "banks",
  controller: BanksController,
  service: BanksService,
  schema: BanksSchema,
  type: "list",
};
export default BanksCollection;
