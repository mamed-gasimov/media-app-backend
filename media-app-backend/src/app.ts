import express from 'express';

import { config } from '@root/config';
import databaseConnection from '@root/setupDatabase';
import { AppServer } from '@root/setupServer';

const log = config.createLogger('app');

class Application {
  public initialize() {
    this.loadConfig();
    databaseConnection();
    const app = express();
    const server = new AppServer(app);
    server.start();
    Application.handleExit();
  }

  private loadConfig() {
    config.validateConfig();
    config.cloudinaryConfig();
  }

  private static handleExit() {
    process.on('uncaughtException', (error: Error) => {
      log.error(`There was an uncaught error: ${error}`);
      Application.shutDownProperly(1);
    });

    process.on('unhandleRejection', (reason: Error) => {
      log.error(`Unhandled rejection at promise: ${reason}`);
      Application.shutDownProperly(2);
    });

    process.on('SIGTERM', () => {
      log.error('Caught SIGTERM');
      Application.shutDownProperly(2);
    });

    process.on('SIGINT', () => {
      log.error('Caught SIGINT');
      Application.shutDownProperly(2);
    });

    process.on('exit', () => {
      log.error('Exiting');
    });
  }

  private static shutDownProperly(exitCode: number) {
    Promise.resolve()
      .then(() => {
        log.info('Shutdown complete');
        process.exit(exitCode);
      })
      .catch((error) => {
        log.error(`Error during shutdown: ${error}`);
        process.exit(1);
      });
  }
}

const application = new Application();
application.initialize();
