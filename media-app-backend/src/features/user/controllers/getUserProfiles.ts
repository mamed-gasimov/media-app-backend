import { Request, Response } from 'express';
import { Types } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { Helpers } from '@global/helpers/helpers';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { BadRequestError } from '@global/helpers/errorHandler';
import { FollowerCache } from '@service/redis/follower.cache';
import { PostCache } from '@service/redis/post.cache';
import { UserCache } from '@service/redis/user.cache';
import { userService } from '@service/db/user.service';
import { followerService } from '@service/db/follower.service';
import { postService } from '@service/db/post.service';
import { IAllUsers, IUserDocument } from '@user/interfaces/user.interface';
import { getUsersSchema } from '@user/schemas/userInfo';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { IPostDocument } from '@post/interfaces/post.interface';

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
  @joiValidation(getUsersSchema)
  public async all(req: Request, res: Response) {
    const { page, pageSize } = req.body;

    const skip = (page - 1) * pageSize;
    const limit = pageSize * page;
    const newSkip = skip === 0 ? skip : skip + 1;

    const allUsers = await GetUserProfiles.prototype.allUsers({
      newSkip,
      limit,
      skip,
      userId: `${req.currentUser!.userId}`,
    });
    const followers = await GetUserProfiles.prototype.followers(`${req.currentUser!.userId}`);

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get users', users: allUsers.users, totalUsers: allUsers.totalUsers, followers });
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

    if (!Helpers.checkValidObjectId(userId)) {
      throw new BadRequestError('Invalid request');
    }

    const cachedUser = await userCache.getUserFromCache(userId);
    const existingUser = cachedUser || (await userService.getUserById(userId));

    if (!existingUser) {
      throw new BadRequestError('User was not found');
    }

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get user profile by id', user: existingUser as IUserDocument });
  }

  private async allUsers({ newSkip, limit, skip, userId }: IUserAll): Promise<IAllUsers> {
    let users;
    let type = '';
    const cachedUsers = (await userCache.getUsersFromCache(newSkip, limit, userId)) as IUserDocument[];
    if (cachedUsers.length) {
      type = 'redis';
      users = cachedUsers;
    } else {
      type = 'mongodb';
      users = await userService.getAllUsers(userId, skip, limit);
    }
    const totalUsers = await GetUserProfiles.prototype.usersCount(type);
    return { users, totalUsers };
  }

  public async profileAndPosts(req: Request, res: Response) {
    const { userId } = req.params;

    if (!Helpers.checkValidObjectId(userId)) {
      throw new BadRequestError('Invalid request');
    }

    const cachedUser = await userCache.getUserFromCache(userId);
    const existingUser = cachedUser || (await userService.getUserById(userId));

    if (!existingUser) {
      throw new BadRequestError('User was not found');
    }

    const userName = Helpers.firstLetterUpperCase(existingUser.username as string);
    const cachedUserPosts: IPostDocument[] = await postCache.getUserPostsFromCache(
      'post',
      parseInt(existingUser.uId as string, 10)
    );
    const userPosts: IPostDocument[] = cachedUserPosts.length
      ? cachedUserPosts
      : await postService.getPosts({ username: userName }, 0, 100, { createdAt: -1 });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get user profile and posts', user: existingUser, posts: userPosts });
  }

  private async usersCount(type: string) {
    const totalUsers =
      type === 'redis' ? await userCache.getTotalUsersInCache() : await userService.getTotalUsersInDb();
    return totalUsers;
  }

  private async followers(userId: string) {
    const cachedFollowers = await followerCache.getFollowersFromCache(`followers:${userId}`);

    if (!cachedFollowers || !cachedFollowers?.length) {
      return null;
    }
    const result = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFollowersData(new Types.ObjectId(userId));
    return result;
  }
}

export const getUserProfiles = new GetUserProfiles();
