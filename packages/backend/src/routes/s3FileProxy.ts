import { Readable } from "stream";
import { Express, Request, Response } from "express";
import { AppRequest } from "@root/types/app";
import { getS3Object, guessContentType, isPublicS3Key } from "@root/utils/s3Util";

export function registerS3FileProxy(app: Express) {
  app.get("/api/files/*", async (req: Request, res: Response) => {
    const key = req.path.replace(/^\/api\/files\//, "");

    if (!key) {
      res.status(400).send({ status: false, message: "File key is required." });
      return;
    }

    if (key.includes("..")) {
      res.status(400).send({ status: false, message: "Invalid file key." });
      return;
    }

    const appReq = req as AppRequest;
    const isPublic = isPublicS3Key(key);

    if (!isPublic && !appReq.User?._id) {
      res.status(403).send({ status: false, message: "You must be logged in to access this file." });
      return;
    }

    try {
      const object = await getS3Object(key);

      if (!object.Body) {
        res.status(404).send({ status: false, message: "File not found." });
        return;
      }

      res.setHeader("Content-Type", object.ContentType || guessContentType(key));
      res.setHeader("Cache-Control", isPublic ? "public, max-age=86400" : "private, no-store");

      const stream = object.Body as Readable;
      stream.on("error", () => {
        if (!res.headersSent) {
          res.status(500).send({ status: false, message: "Failed to read file." });
        }
      });
      stream.pipe(res);
    } catch (ex: any) {
      if (ex.name === "NoSuchKey" || ex.$metadata?.httpStatusCode === 404) {
        res.status(404).send({ status: false, message: "File not found." });
        return;
      }

      res.status(500).send({ status: false, message: ex.message || "Failed to fetch file." });
    }
  });
}
