import { Request, Response } from 'express';
import mongoose from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { FollowerCache } from '@service/redis/follower.cache';
import { PostCache } from '@service/redis/post.cache';
import { UserCache } from '@service/redis/user.cache';
import { userService } from '@service/db/user.service';
import { followerService } from '@service/db/follower.service';
import { postService } from '@service/db/post.service';
import { IAllUsers, IUserDocument } from '@user/interfaces/user.interface';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument } from '@post/interfaces/post.interface';

const PAGE_SIZE = 12;

interface IUserAll {
  newSkip: number;
  limit: number;
  skip: number;
  userId: string;
}

const postCache = new PostCache();
const userCache = new UserCache();
const followerCache = new FollowerCache();

class GetUserProfiles {
  public async all(req: Request, res: Response) {
    const { page } = req.params;
    const skip = (parseInt(page) - 1) * PAGE_SIZE;
    const limit = PAGE_SIZE * parseInt(page);
    const newSkip = skip === 0 ? skip : skip + 1;

    res.status(HTTP_STATUS.OK).json({ message: 'Get users', users: [] });
  }

  public async currentUserProfile(req: Request, res: Response) {
    const cachedUser = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
    const existingUser = cachedUser
      ? cachedUser
      : await userService.getUserById(`${req.currentUser!.userId}`);
    res.status(HTTP_STATUS.OK).json({ message: 'Get user profile', user: existingUser as IUserDocument });
  }

  public async profileByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    const cachedUser = (await userCache.getUserFromCache(userId)) as IUserDocument;
    const existingUser = cachedUser ? cachedUser : await userService.getUserById(userId);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get user profile by id', user: existingUser as IUserDocument });
  }
}

export const getUserProfiles = new GetUserProfiles();
