/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';

import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse, mockFollowerData } from '@root/mocks/followers.mock';
import { FollowerCache } from '@service/redis/follower.cache';
import { getFollowUsers } from '@follower/controllers/getFollowUsers';
import { followerService } from '@service/db/follower.service';
import { existingUserTwo } from '@root/mocks/user.mock';
import { CustomError } from '@global/helpers/errorHandler';
import { userService } from '@service/db/user.service';
import { UserCache } from '@service/redis/user.cache';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/follower.cache');

describe('Get Follow Users', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('userFollowings', () => {
    it('should send correct json response if user following exist in cache', async () => {
      const req = followersMockRequest({}, authUserPayload);
      const res = followersMockResponse();
      jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([mockFollowerData]);

      await getFollowUsers.userFollowings(req, res);
      expect(FollowerCache.prototype.getFollowersFromCache).toBeCalledWith(
        `following:${req.currentUser?.userId}`
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followings',
        followings: [mockFollowerData],
      });
    });

    it('should send correct json response if user following exist in database', async () => {
      const req = followersMockRequest({}, authUserPayload);
      const res = followersMockResponse();
      jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
      jest.spyOn(followerService, 'getFollowingsData').mockResolvedValue([mockFollowerData]);

      await getFollowUsers.userFollowings(req, res);
      expect(followerService.getFollowingsData).toHaveBeenCalledWith(
        new Types.ObjectId(req.currentUser!.userId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followings',
        followings: [mockFollowerData],
      });
    });

    it('should return empty following if user following does not exist', async () => {
      const req = followersMockRequest({}, authUserPayload);
      const res = followersMockResponse();
      jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
      jest.spyOn(followerService, 'getFollowingsData').mockResolvedValue([]);

      await getFollowUsers.userFollowings(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followings',
        followings: [],
      });
    });
  });

  describe('userFollowers', () => {
    it('should throw an error if userId is not available', async () => {
      const req = followersMockRequest({}, authUserPayload, {
        userId: '',
      });
      const res = followersMockResponse();
      getFollowUsers.userFollowers(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if userId is not valid mongodb ObjectId', async () => {
      const req = followersMockRequest({}, authUserPayload, {
        userId: '12345',
      });
      const res = followersMockResponse();
      getFollowUsers.userFollowers(req, res).catch((error: CustomError) => {
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

      getFollowUsers.userFollowers(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('User was not found.');
      });
    });

    it('should send correct json response if user follower exist in cache', async () => {
      const req = followersMockRequest({}, authUserPayload, {
        userId: `${existingUserTwo._id}`,
      });
      const res = followersMockResponse();

      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockImplementation((): any =>
        Promise.resolve({
          social: {},
          notifications: {},
        })
      );
      jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([mockFollowerData]);

      await getFollowUsers.userFollowers(req, res);
      expect(FollowerCache.prototype.getFollowersFromCache).toBeCalledWith(`followers:${req.params.userId}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followers',
        followers: [mockFollowerData],
      });
    });

    it('should send correct json response if user following exist in database', async () => {
      const req = followersMockRequest({}, authUserPayload, {
        userId: `${existingUserTwo._id}`,
      });
      const res = followersMockResponse();

      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockImplementation((): any =>
        Promise.resolve({
          social: {},
          notifications: {},
        })
      );
      jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
      jest.spyOn(followerService, 'getFollowersData').mockResolvedValue([mockFollowerData]);

      await getFollowUsers.userFollowers(req, res);
      expect(followerService.getFollowersData).toHaveBeenCalledWith(new Types.ObjectId(req.params.userId));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followers',
        followers: [mockFollowerData],
      });
    });

    it('should return empty following if user following does not exist', async () => {
      const req = followersMockRequest({}, authUserPayload, {
        userId: `${existingUserTwo._id}`,
      });
      const res = followersMockResponse();

      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockImplementation((): any =>
        Promise.resolve({
          social: {},
          notifications: {},
        })
      );
      jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
      jest.spyOn(followerService, 'getFollowersData').mockResolvedValue([]);

      await getFollowUsers.userFollowers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User followers',
        followers: [],
      });
    });
  });
});
