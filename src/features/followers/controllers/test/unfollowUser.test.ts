/* eslint-disable @typescript-eslint/no-explicit-any */
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { existingUser } from '@root/mocks/user.mock';
import { followerQueue } from '@service/queues/follower.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import { unfollowUser } from '@follower/controllers/unfollowUser';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/follower.cache');

describe('Unfollow User', () => {
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
    unfollowUser.follower(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if followerId is not valid mongodb ObjectId', async () => {
    const req = followersMockRequest({}, authUserPayload, {
      followerId: '12345',
    });
    const res = followersMockResponse();
    unfollowUser.follower(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should send correct json response', async () => {
    const req = followersMockRequest({}, authUserPayload, {
      followerId: '6064861bc25eaa5a5d2f9bf4',
    });
    const res = followersMockResponse();
    jest
      .spyOn(FollowerCache.prototype, 'getFollowersFromCache')
      .mockImplementation((): any => Promise.resolve([{ _id: '6064861bc25eaa5a5d2f9bf4' }]));

    jest.spyOn(FollowerCache.prototype, 'removeFollowerFromCache');
    jest.spyOn(FollowerCache.prototype, 'updateFollowersCountInCache');
    jest.spyOn(followerQueue, 'addFollowerJob');

    await unfollowUser.follower(req, res);
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(
      `following:${existingUser._id}`,
      '6064861bc25eaa5a5d2f9bf4'
    );
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(
      'followers:6064861bc25eaa5a5d2f9bf4',
      existingUser._id
    );
    expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith(
      '6064861bc25eaa5a5d2f9bf4',
      'followersCount',
      -1
    );
    expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith(
      `${existingUser._id}`,
      'followingCount',
      -1
    );
    expect(followerQueue.addFollowerJob).toHaveBeenCalledWith('removeFollowerFromDb', {
      keyOne: '6064861bc25eaa5a5d2f9bf4',
      keyTwo: `${existingUser._id}`,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unfollowed user now',
    });
  });
});
