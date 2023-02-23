"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const redis_connection_1 = require("./shared/services/redis/redis.connection");
const log = config_1.config.createLogger('setupDatabase');
const databaseConnection = () => {
    const connect = () => {
        mongoose_1.default.set('strictQuery', false);
        mongoose_1.default
            .connect(`${config_1.config.DB_URL}`)
            .then(() => {
            log.info('Successfully connected to database!');
            redis_connection_1.redisConnection.connect();
        })
            .catch((error) => {
            log.error('Error connecting to database', error);
            return process.exit(1);
        });
    };
    connect();
    mongoose_1.default.connection.on('disconnected', connect);
};
exports.default = databaseConnection;
//# sourceMappingURL=setupDatabase.js.map