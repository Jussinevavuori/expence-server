import * as path from "path";
import * as express from "express";
import * as socketIO from "socket.io";
import * as passport from "passport";
import * as cookieParser from "cookie-parser";
import * as nocache from "nocache";
import * as morgan from "morgan";
import { createServer, Server } from "http";
import {
  pingRouter,
  authRouter,
  transactionsRouter,
  categoriesRouter,
  configurationRouter,
  stripeRouter,
  budgetsRouter,
  profileRouter,
  feedbackRouter,
  logsRouter,
  avatarRouter,
} from "./controllers";
import { conf } from "./conf";
import { extractAuthentication } from "./middleware/extractAuthentication";
import { PrismaClient } from "@prisma/client";
import { initializeRequestData } from "./middleware/initializeData";
import { handleFailure } from "./middleware/handleFailure";
import { handleErrors } from "./middleware/handleErrors";
import { redirect } from "./utils/redirect";
import { createLogger } from "./utils/createLogger";
import { corsMiddleware } from "./middleware/corsMiddleware";
import { rateLimiters } from "./middleware/rateLimiters";
import { Storage } from "@google-cloud/storage";

const logger = createLogger();

export const app: express.Application = express();
export const http = createServer(app);
export const io = socketIO(http);
export let prisma = new PrismaClient();
export let server: undefined | Server;
export const storage = new Storage({
  keyFilename: path.join(__dirname, "..", conf.google.applicationCredentials),
  projectId: conf.google.projectId,
});
export const bucket = storage.bucket(conf.google.storage.bucketName);

export function startServer() {
  return new Promise<void>(async (resolve, reject) => {
    try {
      logger("Starting server in", process.env.NODE_ENV, "mode");

      // Import configurations
      await require("./socket/socket");
      logger("Websockets configured");

      await require("./passport");
      logger("Passport configured");

      // Connect to DBs
      await prisma.$connect();
      logger("Connected to database");

      // Middleware
      // app.use(requireHttps({ ignoreHosts: [/localhost/] }));
      app.options("*", corsMiddleware());
      app.use(passport.initialize());
      app.use(cookieParser());
      app.use(express.json({ limit: "10mb" }));
      app.use(corsMiddleware());
      app.use(initializeRequestData());
      app.use(extractAuthentication());
      if (process.env.NODE_ENV !== "test") {
        app.use(morgan("tiny"));
      }
      logger("Configured middleware");

      // Rate limit
      app.use(rateLimiters.general());

      // Disable cache
      app.set("etag", false);
      app.use(nocache());

      // Api endpoints
      app.use("/api/ping", pingRouter);
      app.use("/api/auth", authRouter);
      app.use("/api/avatar", avatarRouter);
      app.use("/api/profile", profileRouter);
      app.use("/api/categories", categoriesRouter);
      app.use("/api/transactions", transactionsRouter);
      app.use("/api/budgets", budgetsRouter);
      app.use("/api/config", configurationRouter);
      app.use("/api/stripe", stripeRouter);
      app.use("/api/feedback", feedbackRouter);
      app.use("/api/logs", logsRouter);
      logger("Configured endpoints");

      // Redirect users who navigate to backend URl
      app.use("/", (req, res) => {
        redirect(res).toFrontend("/");
      });

      // Error handler middlewares
      app.use(handleErrors);
      app.use(handleFailure);

      // Start server
      logger("Starting server");
      server = http.listen(conf.port, function () {
        logger(`App is listening on port ${conf.port}`);
        resolve();
      });
    } catch (error) {
      logger("An error occured while starting the server", error);
      reject(error);
    }
  });
}
