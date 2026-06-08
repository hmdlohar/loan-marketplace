import { BaseService, serviceWithContext } from "@lib/BaseService";
import { IBanks, BanksCollectionKey } from "./BanksSchema";
import { ICMSContext } from "@root/types/cms";

class BanksServiceClass extends BaseService<IBanks> {
  constructor(context: ICMSContext) {
    super(BanksCollectionKey, context);
  }
}

const BanksService = serviceWithContext<BanksServiceClass>(BanksServiceClass);
export default BanksService;
export { BanksServiceClass };
