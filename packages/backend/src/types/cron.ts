import CronLogService from "@root/api/cron-log/CronLogService";
import config from "@root/config";

export interface ICronJob {
  title: string;
  description?: string;
  key: string;
  cronExpression: string;
  callback: (objComment: CronComment, args?: any) => Promise<void> | void;
}

interface ICronCommentIO {
  consoleLog?: boolean;
  CronLogID?: string;
  RealTimeUpdateLog?: boolean;
  RealTimeUpdateInterval?: number;
}

export class CronComment {
  io: ICronCommentIO;
  realTimeInterval?: NodeJS.Timeout;
  isChangedForRealTimeUpdate?: boolean;
  aryComment: string[] = [];
  job?: ICronJob;

  constructor(io?: ICronCommentIO) {
    this.io = { consoleLog: false, ...io };
    if (this.io.CronLogID && this.io.RealTimeUpdateLog) {
      this.setRealTimeUpdateLog({
        CronLogID: this.io.CronLogID,
        RealTimeUpdateLog: this.io.RealTimeUpdateLog,
        RealTimeUpdateInterval: this.io.RealTimeUpdateInterval,
      });
    }
  }

  setRealTimeUpdateLog = (io: { CronLogID: string; RealTimeUpdateLog: boolean; RealTimeUpdateInterval?: number }) => {
    this.io.CronLogID = io.CronLogID;
    this.io.RealTimeUpdateLog = io.RealTimeUpdateLog;
    this.io.RealTimeUpdateInterval = io.RealTimeUpdateInterval;
    
    if (this.io.RealTimeUpdateLog) {
      if (this.realTimeInterval) clearInterval(this.realTimeInterval);
      this.realTimeInterval = setInterval(this.updateCronLog, 1000 * (this.io.RealTimeUpdateInterval || 1));
    } else {
      if (this.realTimeInterval) clearInterval(this.realTimeInterval);
    }
  };

  updateCronLog = async () => {
    if (this.io.CronLogID && this.isChangedForRealTimeUpdate) {
      this.isChangedForRealTimeUpdate = false;
      try {
        await CronLogService.context("SYSTEM").update(this.io.CronLogID, {
          Comment: this.getComment(),
        });
      } catch (ex) {
        console.log("Error updating cron log: ", ex);
      }
    }
  };

  cleanup = () => {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }
  };

  do = async (step: string, cb: () => Promise<any>, options?: { noThrow?: boolean }) => {
    this.push(`<div class="bot-comment-block">----------- Start: <u>${step}</u>`);
    try {
      await cb();
    } catch (ex: any) {
      this.push(`---Error: ${ex.message || ex.toString()} in <u>${step}</u>`, "red");
      if (!options?.noThrow) throw ex;
    } finally {
      this.push(`----------- End: <u>${step}</u> </div>`);
    }
  };

  push = (value: string, color?: string) => {
    if (color) value = `<span style="color:${color}">${value}</span><br>`;
    if (this.io?.consoleLog || process.env.NODE_ENV === "development") console.log(value);
    this.aryComment.push(value);
    this.isChangedForRealTimeUpdate = true;
  };

  getComment = () => {
    return this.aryComment.join("\n");
  };
}
