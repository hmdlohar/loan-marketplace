import CronLogCollection from "./api/cron-log/CronLogCollection";

export const collections: Record<string, any> = {
  "cron-log": CronLogCollection,
  //More Here
};
export type ICollectionKeys = keyof typeof collections;
export default collections;
