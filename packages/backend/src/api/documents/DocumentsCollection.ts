import { ICollectionDefinition } from "@root/types/collections";
import DocumentsController from "./DocumentsController";
import { DocumentsSchema } from "./DocumentsSchema";
import DocumentsService from "./DocumentsService";

const DocumentsCollection: ICollectionDefinition = {
  key: "documents",
  controller: DocumentsController,
  service: DocumentsService,
  schema: DocumentsSchema,
  type: "list",
};
export default DocumentsCollection;
