import { BaseService, serviceWithContext } from "@lib/BaseService";
import { IApplications, ApplicationsCollectionKey } from "./ApplicationsSchema";
import { ICMSContext } from "@root/types/cms";

class ApplicationsServiceClass extends BaseService<IApplications> {
  constructor(context: ICMSContext) {
    super(ApplicationsCollectionKey, context);
  }
}

const ApplicationsService = serviceWithContext<ApplicationsServiceClass>(ApplicationsServiceClass);
export default ApplicationsService;
export { ApplicationsServiceClass };
