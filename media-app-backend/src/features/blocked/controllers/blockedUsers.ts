import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { blockedUsersQueue } from '@service/queues/blockedUsers.queue';
import { BlockedUsersCache } from '@service/redis/blockedUsers.cache';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';

const blockedUsersCache = new BlockedUsersCache();

class BlockedUsers {
  public async block(req: Request, res: Response) {
    const { userId } = req.params;

    if (!Helpers.checkValidObjectId(userId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (userId === `${req.currentUser!.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    BlockedUsers.prototype.updateBlockedUser(userId, req.currentUser!.userId, 'block');
    blockedUsersQueue.addBlockedUsersJob('addBlockedUserToDb', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${userId}`,
      type: 'block',
    });
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

    blockedUsers.updateBlockedUser(userId, req.currentUser!.userId, 'unblock');
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
}

export const blockedUsers = new BlockedUsers();
