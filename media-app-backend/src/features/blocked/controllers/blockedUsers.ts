import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { blockedUsersQueue } from '@service/queues/blockedUsers.queue';
import { BlockedUsersCache } from '@service/redis/blockedUsers.cache';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';
import { FollowerCache } from '@service/redis/follower.cache';
import { IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
import { followerService } from '@service/db/follower.service';
import { followerQueue } from '@service/queues/follower.queue';
import { UserCache } from '@service/redis/user.cache';
import { userService } from '@service/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';

const blockedUsersCache = new BlockedUsersCache();
const followerCache = new FollowerCache();
const userCache = new UserCache();

class BlockedUsers {
  public async block(req: Request, res: Response) {
    const { userId } = req.params;

    if (!Helpers.checkValidObjectId(userId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (userId === `${req.currentUser!.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    let existingUser = await userCache.getUserFromCache(userId);
    if (!existingUser || (!existingUser.social && !existingUser.notifications)) {
      existingUser = (await userService.findUserById(userId)) as IUserDocument;
      if (!existingUser) {
        throw new BadRequestError('User was not found.');
      }
    }

    const alreadyBlocked = existingUser?.blockedBy?.find((id) => String(id) === req.currentUser!.userId);
    if (alreadyBlocked) {
      throw new BadRequestError('User was already blocked.');
    }

    await BlockedUsers.prototype.updateBlockedUser(userId, req.currentUser!.userId, 'block');
    blockedUsersQueue.addBlockedUsersJob('addBlockedUserToDb', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${userId}`,
      type: 'block',
    });

    await BlockedUsers.prototype.checkFollowingsBlockedUser(req.currentUser!.userId, userId);
    await BlockedUsers.prototype.checkFollowingsBlockedUser(userId, req.currentUser!.userId);

    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
  }

  public async unblock(req: Request, res: Response) {
    const { userId } = req.params;

    if (!Helpers.checkValidObjectId(userId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (userId === `${req.currentUser!.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    let existingUser = await userCache.getUserFromCache(userId);
    if (!existingUser || (!existingUser.social && !existingUser.notifications)) {
      existingUser = (await userService.findUserById(userId)) as IUserDocument;
      if (!existingUser) {
        throw new BadRequestError('User was not found.');
      }
    }

    const alreadyBlocked = existingUser?.blockedBy?.find((id) => String(id) === req.currentUser!.userId);
    if (!alreadyBlocked) {
      throw new BadRequestError('Already not blocked.');
    }

    await BlockedUsers.prototype.updateBlockedUser(userId, req.currentUser!.userId, 'unblock');
    blockedUsersQueue.addBlockedUsersJob('removeBlockedUserFromDb', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${userId}`,
      type: 'unblock',
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
  }

  private async updateBlockedUser(key: string, userId: string, type: 'block' | 'unblock') {
    const blocked = blockedUsersCache.updateBlockedUserPropInCache(`${userId}`, 'blocked', `${key}`, type);
    const blockedBy = blockedUsersCache.updateBlockedUserPropInCache(
      `${key}`,
      'blockedBy',
      `${userId}`,
      type
    );
    await Promise.all([blocked, blockedBy]);
  }

  private async checkFollowingsBlockedUser(firstUserId: string, secondUserId: string) {
    const followingsList = await followerCache.getFollowersFromCache(`following:${firstUserId}`);
    let alreadyFollow: IFollowerData | null = null;
    let alreadyFollowInDb: IFollowerDocument | undefined;
    if (followingsList && followingsList.length) {
      alreadyFollow = followingsList?.find((item) => String(item._id) === secondUserId) as IFollowerData;
    } else {
      alreadyFollowInDb = await followerService.alreadyFollows(`${firstUserId}`, secondUserId);
    }

    if (alreadyFollow || (!followingsList.length && alreadyFollowInDb)) {
      await BlockedUsers.prototype.unfollowBlockedUser(firstUserId, secondUserId);
    }
  }

  private async unfollowBlockedUser(firstUserId: string, secondUserId: string) {
    const removeFollowerFromCache = followerCache.removeFollowerFromCache(
      `following:${firstUserId}`,
      `${secondUserId}`
    );
    const removeFolloweeFromCache = followerCache.removeFollowerFromCache(
      `followers:${secondUserId}`,
      `${firstUserId}`
    );

    const followersCount = followerCache.updateFollowersCountInCache(`${secondUserId}`, 'followersCount', -1);
    const followeeCount = followerCache.updateFollowersCountInCache(`${firstUserId}`, 'followingCount', -1);
    await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeeCount]);

    followerQueue.addFollowerJob('removeFollowerFromDb', {
      keyOne: `${secondUserId}`,
      keyTwo: `${firstUserId}`,
    });
  }
}

export const blockedUsers = new BlockedUsers();
