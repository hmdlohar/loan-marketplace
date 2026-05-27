import CronLogService from "@root/api/cron-log/CronLogService";
import config from "@root/config";
import { CronComment, ICronJob } from "@root/types/cron";
import nodeSchedule from "node-schedule";
import { cronJobs } from "./cron";

export function initCron() {
  if (!config.ENABLE_CRON) {
    console.log("Cron is disabled");
    return;
  }
  if ((globalThis as any).isCronInit) {
    console.log("Cron already initialized");
    return;
  }
  console.log(`Initializing ${cronJobs.length} cron jobs.`);
  for (let job of cronJobs) {
    nodeSchedule.scheduleJob(job.title, job.cronExpression, async () => {
      await runCronJobWithLog(job);
    });
  }

  (globalThis as any).isCronInit = true;
}

export async function runCronJobWithLog(job: ICronJob, args?: any) {
  let cronLog;
  let objComment = new CronComment({ consoleLog: args?.consoleLog });
  try {
    objComment.push(`Starting ${job.key}`);
    cronLog = await CronLogService.context("SYSTEM").create({
      Key: job.key,
      Status: "RUNNING",
      Comment: objComment.getComment(),
    });
    if (args?.RealTimeUpdateLog) {
      objComment.setRealTimeUpdateLog({
        CronLogID: cronLog.id,
        RealTimeUpdateLog: args?.RealTimeUpdateLog,
      });
    }
    await job.callback(objComment, args);

    await CronLogService.context("SYSTEM").update(cronLog.id, {
      Status: "SUCCESS",
      Comment: objComment.getComment(),
    });
  } catch (ex: any) {
    if (cronLog) {
      objComment.push(ex.message || ex.toString(), "red");
      await CronLogService.context("SYSTEM").update(cronLog.id, {
        Status: "FAILED",
        Comment: objComment.getComment(),
        ex: { stack: ex.stack, ...ex },
      });
    }
  } finally {
    objComment.cleanup();
  }
  return objComment;
}

export async function runMigratorWithCronLog(
  callback: (objComment: CronComment, args?: any) => any,
  args?: {
    consoleLog?: boolean;
    RealTimeUpdateLog?: boolean;
  }
) {
  let objComment = await runCronJobWithLog(
    {
      key: "MIGRATION",
      title: "Migration Cron Logs",
      description: ` `,
      callback: callback,
      cronExpression: "0 0 0 0 0",
    },
    args
  );
  return objComment;
}
