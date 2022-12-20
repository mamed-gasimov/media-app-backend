import { remove } from 'lodash';
import mongoose from 'mongoose';

import { config } from '@root/config';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { ServerError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { BaseCache } from '@service/redis/base.cache';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

const log = config.createLogger('followersCache');
const userCache = new UserCache();

export class FollowerCache extends BaseCache {
  constructor() {
    super('followersCache');
  }

  public async saveFollowerToCache(key: string, value: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(key, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removeFollowerFromCache(key: string, value: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 1, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateFollowersCountInCache(userId: string, prop: 'followersCount' | 'followingCount', value: 1 | -1) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      let incValue: 1 | -1 | 0 = value;
      if (value === -1) {
        const countStr = await this.client.HMGET(`users:${userId}`, prop);
        const count = Number(countStr[0]);
        if (count === 0) {
          incValue = 0;
        }
      }

      await this.client.HINCRBY(`users:${userId}`, prop, incValue);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getFollowersFromCache(key: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response = await this.client.LRANGE(key, 0, -1);
      const list: IFollowerData[] = [];
      for (const item of response) {
        const user = await userCache.getUserFromCache(item);
        const data: IFollowerData = {
          _id: new mongoose.Types.ObjectId(user._id),
          username: user.username!,
          avatarColor: user.avatarColor!,
          postCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          profilePicture: user.profilePicture,
          uId: user.uId!,
          userProfile: user,
        };
        list.push(data);
      }
      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
