"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const setupDatabase_1 = __importDefault(require("./setupDatabase"));
const setupServer_1 = require("./setupServer");
const log = config_1.config.createLogger('app');
class Application {
    initialize() {
        this.loadConfig();
        (0, setupDatabase_1.default)();
        const app = (0, express_1.default)();
        const server = new setupServer_1.AppServer(app);
        server.start();
        Application.handleExit();
    }
    loadConfig() {
        config_1.config.validateConfig();
        config_1.config.cloudinaryConfig();
    }
    static handleExit() {
        process.on('uncaughtException', (error) => {
            log.error(`There was an uncaught error: ${error}`);
            Application.shutDownProperly(1);
        });
        process.on('unhandleRejection', (reason) => {
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
    static shutDownProperly(exitCode) {
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
//# sourceMappingURL=app.js.map