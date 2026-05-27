import { Schema } from "mongoose";

export default function configureDBHooks(schema: Schema<any>, collectionKey: string, coll: any) {
  return schema;
}
