import { Types } from 'mongoose';
import { map } from 'lodash';

import { FollowerModel } from '@follower/models/follower.model';
import { UserModel } from '@user/models/user.model';
import { UserCache } from '@service/redis/user.cache';
import { IFollowerDocument } from '@follower/interfaces/follower.interface';

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

    const users = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } },
        },
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: 1 } },
        },
      },
    ]);

    await Promise.all([users, userCache.getUserFromCache(followeeId)]);
  }

  public async getFolloweesIds(userId: string): Promise<string[]> {
    const followee = await FollowerModel.aggregate([
      { $match: { followerId: new Types.ObjectId(userId) } },
      {
        $project: {
          followeeId: 1,
          _id: 0,
        },
      },
    ]);
    return map(followee, (result) => result.followeeId.toString());
  }

  public async alreadyFollows(userId: string, followeeId: string) {
    const data = (await FollowerModel.findOne({
      followerId: new Types.ObjectId(userId),
      followeeId: new Types.ObjectId(followeeId),
    })) as IFollowerDocument;

    return data || null;
  }
}

export const followerService = new FollowerService();
