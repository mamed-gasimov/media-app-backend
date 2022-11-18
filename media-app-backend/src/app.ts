import express from "express";
import { AppServer } from "./setupServer";

class Application {
  public initialize(): void {
    const app = express();
    const server = new AppServer(app);
    server.start();
  }
}

const application = new Application();
application.initialize();
