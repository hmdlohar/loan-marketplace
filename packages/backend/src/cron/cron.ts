import { ICronJob, CronComment } from "@root/types/cron";
import CronLogService from "@root/api/cron-log/CronLogService";

export const cronJobs: ICronJob[] = [
  {
    key: "CLEAR_OLD_LOGS",
    title: "Clear old logs",
    cronExpression: "0 0 * * *",
    callback: async (objComment: CronComment) => {
      await CronLogService.context("SYSTEM").removeOldLog(objComment);
    },
  },
];
