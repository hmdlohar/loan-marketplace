import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import cors from "cors";
import { createServer, Server } from "http";
import config from "./config";
import { initMongo } from "@lib/initMongo";
import { collections } from "@root/collections";
import { populateCollectionRoutes } from "@lib/initRouteHandler";
import authDecode from "./middlewares/authDecode";
import { initCron } from "./cron/initCron";

const app: Express = express();
const server: Server = createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(authDecode);

populateCollectionRoutes(collections, app);

const port = process.env.PORT || config.PORT;

initMongo()
  .then(() => {
    initCron();
    server.listen(port, () => {
      console.log("App started on port: ", port);
    });
  })
  .catch((ex: any) => {
    console.log("Mongodb connection fail: ", ex.message);
  });
export { app, server };
