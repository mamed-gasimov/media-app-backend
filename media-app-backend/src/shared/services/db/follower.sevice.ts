import { BulkWriteResult } from 'mongodb';
import { Query, Types } from 'mongoose';
import { map } from 'lodash';

import { FollowerModel } from '@follower/models/follower.model';
import { UserModel } from '@user/models/user.model';
import { IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
import { IQueryDeleted, IQueryComplete } from '@post/interfaces/post.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { emailQueue } from '@service/queues/email.queue';
import { UserCache } from '@service/redis/user.cache';

const userCache: UserCache = new UserCache();

class FollowerService {
  public async addFollowerToDb(
    userId: string,
    followeeId: string,
    username: string,
    followerDocumentId: Types.ObjectId
  ) {
    const followeeObjectId = new Types.ObjectId(followeeId);
    const followerObjectId = new Types.ObjectId(userId);

    const following = await FollowerModel.create({
      _id: followerDocumentId,
      followeeId: followeeObjectId,
      followerId: followerObjectId,
    });
  }
}

export const followerService = new FollowerService();
