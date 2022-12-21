import { Request, Response } from 'express';
import { Types } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { FollowerCache } from '@service/redis/follower.cache';
import { followerService } from '@service/db/follower.sevice';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';
import { UserCache } from '@service/redis/user.cache';
import { userService } from '@service/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';

const followerCache = new FollowerCache();
const userCache = new UserCache();

class GetFollowUsers {
  public async userFollowings(req: Request, res: Response) {
    const userObjectId = new Types.ObjectId(req.currentUser!.userId);
    const cachedFollowees = await followerCache.getFollowersFromCache(`following:${req.currentUser!.userId}`);
    const followings = cachedFollowees.length
      ? cachedFollowees
      : await followerService.getFollowingsData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: 'User followings', followings });
  }

  public async userFollowers(req: Request, res: Response) {
    const { userId } = req.params;

    if (!Helpers.checkValidObjectId(userId)) {
      throw new BadRequestError('Invalid request.');
    }

    let existingUser = await userCache.getUserFromCache(userId);
    if (!existingUser) {
      existingUser = (await userService.findUserById(userId)) as IUserDocument;
      if (!existingUser) {
        throw new BadRequestError('User was not found.');
      }
    }

    const userObjectId = new Types.ObjectId(userId);
    const cachedFollowers = await followerCache.getFollowersFromCache(`followers:${userId}`);
    const followers = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFollowersData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
  }
}

export const getFollowUsers = new GetFollowUsers();
