import mongoose from 'mongoose';

import { config } from '@root/config';
import { redisConnection } from '@service/redis/redis.connection';

const log = config.createLogger('setupDatabase');

const databaseConnection = () => {
  const connect = () => {
    mongoose
      .connect(`${config.DB_URL}`)
      .then(() => {
        log.info('Successfully connected to database!');
        redisConnection.connect();
      })
      .catch((error) => {
        log.error('Error connecting to database', error);
        return process.exit(1);
      });
  };

  connect();

  mongoose.connection.on('disconnected', connect);
};

export default databaseConnection;
