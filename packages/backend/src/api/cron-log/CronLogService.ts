import { BaseService, serviceWithContext } from "@lib/BaseService";
import { ICronLog, CronLogCollectionKey } from "./CronLogSchema";
import { ICMSContext } from "@root/types/cms";

class CronLogServiceClass extends BaseService<ICronLog> {
  constructor(context: ICMSContext) {
    super(CronLogCollectionKey, context);
  }

  async removeOldLog(objComment: any) {
    objComment.push("Removing cron logs older than 7 days...");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const result = await this.deleteMany({ CreatedAt: { $lt: sevenDaysAgo } });
    objComment.push(`Deleted ${result.deletedCount} old cron logs.`);
  }
}

const CronLogService = serviceWithContext<CronLogServiceClass>(CronLogServiceClass);
export default CronLogService;
export { CronLogServiceClass };
