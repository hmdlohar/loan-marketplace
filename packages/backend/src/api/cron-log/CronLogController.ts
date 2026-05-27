import RunCronJobDefinition from "./fns/RunCronJob";
import { CronLogCollectionKey } from "./CronLogSchema";
import { createController, rpcItem } from "@lib/BaseController";

export default createController(CronLogCollectionKey, [
  rpcItem({
    route: "/RunCronJob",
    definition: RunCronJobDefinition,
  }),]);
