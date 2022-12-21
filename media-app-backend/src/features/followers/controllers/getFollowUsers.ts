import { Request, Response } from 'express';
import { Types } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { FollowerCache } from '@service/redis/follower.cache';
import { followerService } from '@service/db/follower.sevice';

const followerCache = new FollowerCache();

class GetFollowUsers {
  public async userFollowings(req: Request, res: Response) {
    const userObjectId = new Types.ObjectId(req.currentUser!.userId);
    const cachedFollowees = await followerCache.getFollowersFromCache(`following:${req.currentUser!.userId}`);
    const followings = cachedFollowees.length
      ? cachedFollowees
      : await followerService.getFollowingsData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: 'User following', followings });
  }

  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId = new Types.ObjectId(req.params.userId);
    const cachedFollowers = await followerCache.getFollowersFromCache(`followers:${req.params.userId}`);
    const followers = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFollowersData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
  }
}

export const getFollowUsers = new GetFollowUsers();
