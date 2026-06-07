import { collections } from "@root/collections";
import { Model } from "mongoose";
import { getMongoConnection, IMongoConnections } from "./initMongo";
import configureDBHooks from "./configureDBHooks";

export { dataModifierSchema } from "./dataModifierSchema";

export function getModal<T>(key: string, options: { connection?: IMongoConnections } = {}): Model<T> {
  const collName = key as keyof typeof collections;
  if (!collections[collName]) throw new Error(`No model found for '${key}'`);
  let coll = collections[collName];
  let schema = coll.schema;
  if (coll) {
    configureDBHooks(schema, key, coll);
  }

  const Model = getMongoConnection(options.connection || coll.dbConnection).model<T>(
    coll.key,
    schema,
    coll.key.replace(/-/, "")
  );
  return Model;
}

export function getService<T = any>(key: string) {
  const collName = key as keyof typeof collections;
  if (!collections[collName]) throw new Error(`No service found for '${key}'`);
  return collections[collName].service;
}

export function getCollection(key: string) {
  const collName = key as keyof typeof collections;
  if (!collections[collName]) throw new Error(`No collection found for '${key}'`);
  return collections[collName];
}

export function getController(key: string) {
  const collName = key as keyof typeof collections;
  if (!collections[collName]) throw new Error(`No controller found for '${key}'`);
  return collections[collName].controller;
}

