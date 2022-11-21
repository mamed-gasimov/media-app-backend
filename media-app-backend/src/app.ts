import express from 'express';

import { config } from '@root/config';
import databaseConnection from '@root/setupDatabase';
import { AppServer } from '@root/setupServer';

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
