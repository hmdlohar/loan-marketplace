import { ICollectionDefinition } from "@root/types/collections";
import CronLogController from "./CronLogController";
import { CronLogSchema } from "./CronLogSchema";
import CronLogService from "./CronLogService";

const CronLogCollection: ICollectionDefinition = {
  key: "cron-log",
  controller: CronLogController,
  service: CronLogService,
  schema: CronLogSchema,
  type: "list",
};

export default CronLogCollection;
