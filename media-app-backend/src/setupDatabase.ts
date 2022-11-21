import mongoose from 'mongoose';

import { config } from '@root/config';

const log = config.createLogger('setup database');

const databaseConnection = () => {
  const connect = () => {
    mongoose
      .connect(`${config.DB_URL}`)
      .then(() => {
        log.info('Successfully connected to database!');
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
