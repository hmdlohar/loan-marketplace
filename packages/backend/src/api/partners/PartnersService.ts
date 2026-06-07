import { BaseService, serviceWithContext } from "@lib/BaseService";
import { IPartners, PartnersCollectionKey } from "./PartnersSchema";
import { ICMSContext } from "@root/types/cms";

class PartnersServiceClass extends BaseService<IPartners> {
  constructor(context: ICMSContext) {
    super(PartnersCollectionKey, context);
  }
}

const PartnersService = serviceWithContext<PartnersServiceClass>(PartnersServiceClass);
export default PartnersService;
export { PartnersServiceClass };
