import { BaseService, serviceWithContext } from "@lib/BaseService";
import { IDocuments, DocumentsCollectionKey } from "./DocumentsSchema";
import { ICMSContext } from "@root/types/cms";

class DocumentsServiceClass extends BaseService<IDocuments> {
  constructor(context: ICMSContext) {
    super(DocumentsCollectionKey, context);
  }
}

const DocumentsService = serviceWithContext<DocumentsServiceClass>(DocumentsServiceClass);
export default DocumentsService;
export { DocumentsServiceClass };
