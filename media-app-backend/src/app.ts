import express from "express";
import { AppServer } from "./setupServer";
import databaseConnection from "./setupDatabase";
import { config } from "./config";

class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app = express();
    const server = new AppServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
  }
}

const application = new Application();
application.initialize();
