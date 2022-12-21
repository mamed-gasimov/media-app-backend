import { Types } from 'mongoose';
import { map } from 'lodash';

import { FollowerModel } from '@follower/models/follower.model';
import { UserModel } from '@user/models/user.model';
import { UserCache } from '@service/redis/user.cache';
import { IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';

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

  public async removeFollowerFromDb(followeeId: string, followerId: string) {
    const followeeObjectId = new Types.ObjectId(followeeId);
    const followerObjectId = new Types.ObjectId(followerId);

    const unfollow = FollowerModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId,
    });

    const users = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1, $min: 0 } },
        },
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1, $min: 0 } },
        },
      },
    ]);

    await Promise.all([unfollow, users]);
  }

  public async getFollowingsData(userObjectId: Types.ObjectId) {
    return this.getFollowUserData(userObjectId, 'followeeId');
  }

  public async getFollowersData(userObjectId: Types.ObjectId) {
    return this.getFollowUserData(userObjectId, 'followerId');
  }

  private async getFollowUserData(userObjectId: Types.ObjectId, followTypeId: 'followerId' | 'followeeId') {
    let key: 'followerId' | 'followeeId' = 'followerId';
    if (followTypeId === 'followerId') {
      key = 'followeeId';
    } else if (followTypeId === 'followeeId') {
      key = 'followerId';
    }

    const followee: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { [key]: userObjectId } },
      { $lookup: { from: 'User', localField: followTypeId, foreignField: '_id', as: followTypeId } },
      { $unwind: `$${followTypeId}` },
      { $lookup: { from: 'Auth', localField: `${followTypeId}.authId`, foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $addFields: {
          _id: `$${followTypeId}._id`,
          username: '$authId.username',
          avatarColor: '$authId.avatarColor',
          uId: '$authId.uId',
          postCount: `$${followTypeId}.postsCount`,
          followersCount: `$${followTypeId}.followersCount`,
          followingCount: `$${followTypeId}.followingCount`,
          profilePicture: `$${followTypeId}.profilePicture`,
          userProfile: `$${followTypeId}`,
        },
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0,
        },
      },
    ]);
    return followee;
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

    return data;
  }
}

export const followerService = new FollowerService();
