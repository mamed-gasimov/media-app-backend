import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { FollowerCache } from '@service/redis/follower.cache';
import { UserCache } from '@service/redis/user.cache';
import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { userService } from '@service/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
import { socketIOFollowerObject } from '@socket/follower.sockets';
import { followerQueue } from '@service/queues/follower.queue';
import { followerService } from '@service/db/follower.sevice';

const followerCache = new FollowerCache();
const userCache = new UserCache();

class FollowUser {
  public async follower(req: Request, res: Response) {
    const { followerId } = req.params;

    if (!Helpers.checkValidObjectId(followerId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (followerId === `${req.currentUser?.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    const followingsList = await followerCache.getFollowersFromCache(`following:${req.currentUser!.userId}`);
    let alreadyFollow: IFollowerDocument | IFollowerData | null;
    if (followingsList && followingsList.length) {
      alreadyFollow = followingsList.find((item) => String(item._id) === followerId) as IFollowerData;
    } else {
      alreadyFollow = await followerService.alreadyFollows(`${req.currentUser?.userId}`, followerId);
    }

    if (alreadyFollow) {
      throw new BadRequestError('Already following.');
    }

    let follower = await userCache.getUserFromCache(followerId);
    if (!follower) {
      follower = (await userService.findUserById(followerId)) as IUserDocument;
      if (!follower) {
        throw new BadRequestError('User was not found');
      }
    }

    const followersCount = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
    const followeeCount = followerCache.updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
    await Promise.all([followersCount, followeeCount]);

    const followerObjectId = new ObjectId();
    const addFolloweeData = FollowUser.prototype.userData(follower);
    socketIOFollowerObject.emit('add follower', addFolloweeData);

    const addFollowerToCache = followerCache.saveFollowerToCache(
      `following:${req.currentUser!.userId}`,
      `${followerId}`
    );
    const addFolloweeToCache = followerCache.saveFollowerToCache(
      `followers:${followerId}`,
      `${req.currentUser!.userId}`
    );
    await Promise.all([addFollowerToCache, addFolloweeToCache]);

    followerQueue.addFollowerJob('addFollowerToDb', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      username: req.currentUser!.username,
      followerDocumentId: followerObjectId as Types.ObjectId,
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user,
    };
  }
}

export const followUser = new FollowUser();
