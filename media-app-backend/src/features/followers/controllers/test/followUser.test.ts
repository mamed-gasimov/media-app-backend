/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';

import { authUserPayload } from '@root/mocks/auth.mock';
import * as followerServer from '@socket/follower.sockets';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { existingUser } from '@root/mocks/user.mock';
import { followerQueue } from '@service/queues/follower.queue';
import { followUser } from '@follower/controllers/followUser';
import { UserCache } from '@service/redis/user.cache';
import { FollowerCache } from '@service/redis/follower.cache';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/redis/follower.cache');

Object.defineProperties(followerServer, {
  socketIOFollowerObject: {
    value: new Server(),
    writable: true,
  },
});

describe('Follow User', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if followerId is not available', async () => {
    const req = followersMockRequest({}, authUserPayload, {
      followerId: '',
    });
    const res = followersMockResponse();
    followUser.follower(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if followerId is not valid mongodb ObjectId', async () => {
    const req = followersMockRequest({}, authUserPayload, {
      followerId: '12345',
    });
    const res = followersMockResponse();
    followUser.follower(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should call updateFollowersCountInCache', async () => {
    const req = followersMockRequest({}, authUserPayload, {
      followerId: '6064861bc25eaa5a5d2f9bf4',
    });
    const res = followersMockResponse();

    jest
      .spyOn(FollowerCache.prototype, 'getFollowersFromCache')
      .mockImplementation((): any => Promise.resolve([{ _id: '12345' }]));

    jest.spyOn(FollowerCache.prototype, 'updateFollowersCountInCache');
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

    await followUser.follower(req, res);
    expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith(
      '6064861bc25eaa5a5d2f9bf4',
      'followersCount',
      1
    );
    expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith(
      `${existingUser._id}`,
      'followingCount',
      1
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Following user now',
    });
  });

  it('should call saveFollowerToCache', async () => {
    const req = followersMockRequest({}, authUserPayload, {
      followerId: '6064861bc25eaa5a5d2f9bf4',
    });
    const res = followersMockResponse();
    jest
      .spyOn(FollowerCache.prototype, 'getFollowersFromCache')
      .mockImplementation((): any => Promise.resolve([{ _id: '12345' }]));
    jest.spyOn(followerServer.socketIOFollowerObject, 'emit');
    jest.spyOn(FollowerCache.prototype, 'saveFollowerToCache');
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

    await followUser.follower(req, res);
    expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledTimes(1);
    expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(
      `following:${req.currentUser!.userId}`,
      '6064861bc25eaa5a5d2f9bf4'
    );
    expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(
      'followers:6064861bc25eaa5a5d2f9bf4',
      `${existingUser._id}`
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Following user now',
    });
  });

  it('should call followerQueue addFollowerJob', async () => {
    const req = followersMockRequest({}, authUserPayload, {
      followerId: '6064861bc25eaa5a5d2f9bf4',
    });
    const res = followersMockResponse();
    jest
      .spyOn(FollowerCache.prototype, 'getFollowersFromCache')
      .mockImplementation((): any => Promise.resolve([{ _id: '12345' }]));
    const spy = jest.spyOn(followerQueue, 'addFollowerJob');

    await followUser.follower(req, res);
    expect(followerQueue.addFollowerJob).toHaveBeenCalledWith('addFollowerToDb', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: '6064861bc25eaa5a5d2f9bf4',
      username: req.currentUser?.username,
      followerDocumentId: spy.mock.calls[0][1].followerDocumentId,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Following user now',
    });
  });
});
