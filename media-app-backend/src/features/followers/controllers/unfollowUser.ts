import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { FollowerCache } from '@service/redis/follower.cache';
import { followerQueue } from '@service/queues/follower.queue';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';
import { IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
import { followerService } from '@service/db/follower.sevice';

const followerCache = new FollowerCache();

class UnfollowUser {
  public async follower(req: Request, res: Response) {
    const { followerId } = req.params;

    if (!Helpers.checkValidObjectId(followerId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (followerId === `${req.currentUser!.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    const followingsList = await followerCache.getFollowersFromCache(`following:${req.currentUser!.userId}`);
    let alreadyFollow: IFollowerData | null = null;
    let alreadyFollowInDb: IFollowerDocument | undefined;
    if (followingsList && followingsList.length) {
      alreadyFollow = followingsList.find((item) => String(item._id) === followerId) as IFollowerData;
    } else {
      alreadyFollowInDb = await followerService.alreadyFollows(`${req.currentUser?.userId}`, followerId);
    }

    if (!alreadyFollow || (!followingsList.length && !alreadyFollowInDb)) {
      throw new BadRequestError('Already not following.');
    }

    const removeFollowerFromCache = followerCache.removeFollowerFromCache(
      `following:${req.currentUser!.userId}`,
      `${followerId}`
    );
    const removeFolloweeFromCache = followerCache.removeFollowerFromCache(
      `followers:${followerId}`,
      `${req.currentUser!.userId}`
    );

    const followersCount = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', -1);
    const followeeCount = followerCache.updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', -1);
    await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeeCount]);

    followerQueue.addFollowerJob('removeFollowerFromDb', {
      keyOne: `${followerId}`,
      keyTwo: `${req.currentUser!.userId}`,
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}

export const unfollowUser = new UnfollowUser();
