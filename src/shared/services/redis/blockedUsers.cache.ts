import { remove } from 'lodash';

import { config } from '@root/config';
import { ServerError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { BaseCache } from '@service/redis/base.cache';

const log = config.createLogger('blockedUsersCache');

export class BlockedUsersCache extends BaseCache {
  constructor() {
    super('blockedUsersCache');
  }

  public async updateBlockedUserPropInCache(
    key: string,
    prop: string,
    userId: string,
    type: 'block' | 'unblock'
  ) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response = (await this.client.HGET(`users:${key}`, prop)) as string;
      const multi = this.client.multi();
      let blocked = Helpers.parseJson(response) as string[];
      if (type === 'block') {
        blocked = [...new Set([...blocked, userId])];
      } else if (type === 'unblock') {
        remove(blocked, (id: string) => id === userId);
        blocked = [...blocked];
      }

      const dataToSave = [`${prop}`, JSON.stringify(blocked)];
      multi.HSET(`users:${key}`, dataToSave);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
