/* eslint-disable @typescript-eslint/no-explicit-any */
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { blockedUsers } from '@blocked/controllers/blockedUsers';
import { blockedUsersQueue } from '@service/queues/blockedUsers.queue';
import { BlockedUsersCache } from '@service/redis/blockedUsers.cache';
import { UserCache } from '@service/redis/user.cache';
import { FollowerCache } from '@service/redis/follower.cache';
import { CustomError } from '@global/helpers/errorHandler';
import { userService } from '@service/db/user.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/follower.cache');
jest.mock('@service/redis/user.cache');
jest.mock('@service/redis/blockedUsers.cache');

describe('BlockedUsers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('block', () => {
    it('should throw an error if userId is not available', async () => {
      const req = followersMockRequest({}, authUserPayload, {
        userId: '',
      });
      const res = followersMockResponse();
      blockedUsers.block(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if userId is not valid mongodb ObjectId', async () => {
      const req = followersMockRequest({}, authUserPayload, {
        userId: '12345',
      });
      const res = followersMockResponse();
      blockedUsers.block(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if user was not found', async () => {
      const req = followersMockRequest({}, authUserPayload, {
        userId: '6064861bc25eaa5a5d2f9bf4',
      });
      const res = followersMockResponse();

      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockImplementation((): any =>
        Promise.resolve({
          social: '',
          notifications: '',
        })
      );

      jest.spyOn(userService, 'findUserById').mockImplementation((): any => Promise.resolve(null));

      blockedUsers.block(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('User was not found.');
      });
    });

    it('should send correct json response', async () => {
      const req = followersMockRequest({}, authUserPayload, { userId: '6064861bc25eaa5a5d2f9bf4' });
      const res = followersMockResponse();

      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockImplementation((): any =>
        Promise.resolve({
          social: {},
          notifications: {},
        })
      );
      jest.spyOn(BlockedUsersCache.prototype, 'updateBlockedUserPropInCache');
      jest.spyOn(blockedUsersQueue, 'addBlockedUsersJob');

      jest
        .spyOn(FollowerCache.prototype, 'getFollowersFromCache')
        .mockImplementation((): any => Promise.resolve([{}]));

      await blockedUsers.block(req, res);
      expect(BlockedUsersCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(
        '6064861bc25eaa5a5d2f9bf4',
        'blockedBy',
        `${req.currentUser?.userId}`,
        'block'
      );
      expect(BlockedUsersCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(
        `${req.currentUser?.userId}`,
        'blocked',
        '6064861bc25eaa5a5d2f9bf4',
        'block'
      );
      expect(blockedUsersQueue.addBlockedUsersJob).toHaveBeenCalledWith('addBlockedUserToDb', {
        keyOne: `${req.currentUser?.userId}`,
        keyTwo: '6064861bc25eaa5a5d2f9bf4',
        type: 'block',
      });

      expect(FollowerCache.prototype.getFollowersFromCache).toHaveBeenCalledWith(
        `following:${req.currentUser!.userId}`
      );
      expect(FollowerCache.prototype.getFollowersFromCache).toHaveBeenCalledWith(
        'following:6064861bc25eaa5a5d2f9bf4'
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User blocked',
      });
    });
  });

  // describe('unblock', () => {
  //   it('should send correct json response', async () => {
  //     const req = followersMockRequest({}, authUserPayload, {
  //       userId: '6064861bc25eaa5a5d2f9bf4',
  //     });
  //     const res = followersMockResponse();
  //     jest.spyOn(BlockedUsersCache.prototype, 'updateBlockedUserPropInCache');
  //     jest.spyOn(blockedUsersQueue, 'addBlockedUsersJob');

  //     await blockedUsers.unblock(req, res);
  //     expect(BlockedUsersCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(
  //       '6064861bc25eaa5a5d2f9bf4',
  //       'blockedBy',
  //       `${req.currentUser?.userId}`,
  //       'unblock'
  //     );
  //     expect(BlockedUsersCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(
  //       `${req.currentUser?.userId}`,
  //       'blocked',
  //       '6064861bc25eaa5a5d2f9bf4',
  //       'unblock'
  //     );
  //     expect(blockedUsersQueue.addBlockedUsersJob).toHaveBeenCalledWith('removeBlockedUserFromDb', {
  //       keyOne: `${req.currentUser?.userId}`,
  //       keyTwo: '6064861bc25eaa5a5d2f9bf4',
  //       type: 'unblock',
  //     });
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: 'User unblocked',
  //     });
  //   });
  // });
});
