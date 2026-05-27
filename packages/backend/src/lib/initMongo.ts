import * as mongoose from "mongoose";
import config from "../config";

const cons: {
  default: mongoose.Connection | null;
} = {
  default: null,
};

export type IMongoConnections = keyof typeof cons;

mongoose.set("strictQuery", false);

export async function initMongo() {
  const mongoUrl = process.env.MONGODB_URL || config.MONGODB_URL;
  if (!mongoUrl) throw new Error("Provide MONGODB_URL in environment or config");

  let m1 = new mongoose.Mongoose();
  await m1.connect(mongoUrl, {});
  cons.default = m1.connection;
  console.log("Mongodb default connection successful");
}

export function getMongoConnection(conName: "default" = "default") {
  if (!cons[conName]) throw new Error(`Connection ${conName} not initialized`);
  return cons[conName] as mongoose.Connection;
}
