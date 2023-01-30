import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';

const log = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection');
  }

  async connect() {
    try {
      await this.client.connect();
      log.info(`Redis connection: ${await this.client.ping()}`);
    } catch (error) {
      log.error(error);
    }
  }
}

export const redisConnection = new RedisConnection();
