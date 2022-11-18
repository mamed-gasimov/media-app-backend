import express from "express";
import { AppServer } from "./setupServer";
import databaseConnection from "./setupDatabase";

class Application {
  public initialize(): void {
    databaseConnection();
    const app = express();
    const server = new AppServer(app);
    server.start();
  }
}

const application = new Application();
application.initialize();
