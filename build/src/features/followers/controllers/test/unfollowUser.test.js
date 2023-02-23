"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const auth_mock_1 = require("../../../../mocks/auth.mock");
const followers_mock_1 = require("../../../../mocks/followers.mock");
const user_mock_1 = require("../../../../mocks/user.mock");
const follower_queue_1 = require("../../../../shared/services/queues/follower.queue");
const follower_cache_1 = require("../../../../shared/services/redis/follower.cache");
const unfollowUser_1 = require("../../controllers/unfollowUser");
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
    it('should throw an error if followerId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
            followerId: '',
        });
        const res = (0, followers_mock_1.followersMockResponse)();
        unfollowUser_1.unfollowUser.follower(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if followerId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
            followerId: '12345',
        });
        const res = (0, followers_mock_1.followersMockResponse)();
        unfollowUser_1.unfollowUser.follower(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
            followerId: '6064861bc25eaa5a5d2f9bf4',
        });
        const res = (0, followers_mock_1.followersMockResponse)();
        jest
            .spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache')
            .mockImplementation(() => Promise.resolve([{ _id: '6064861bc25eaa5a5d2f9bf4' }]));
        jest.spyOn(follower_cache_1.FollowerCache.prototype, 'removeFollowerFromCache');
        jest.spyOn(follower_cache_1.FollowerCache.prototype, 'updateFollowersCountInCache');
        jest.spyOn(follower_queue_1.followerQueue, 'addFollowerJob');
        yield unfollowUser_1.unfollowUser.follower(req, res);
        expect(follower_cache_1.FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledTimes(2);
        expect(follower_cache_1.FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(`following:${user_mock_1.existingUser._id}`, '6064861bc25eaa5a5d2f9bf4');
        expect(follower_cache_1.FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith('followers:6064861bc25eaa5a5d2f9bf4', user_mock_1.existingUser._id);
        expect(follower_cache_1.FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledTimes(2);
        expect(follower_cache_1.FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith('6064861bc25eaa5a5d2f9bf4', 'followersCount', -1);
        expect(follower_cache_1.FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith(`${user_mock_1.existingUser._id}`, 'followingCount', -1);
        expect(follower_queue_1.followerQueue.addFollowerJob).toHaveBeenCalledWith('removeFollowerFromDb', {
            keyOne: '6064861bc25eaa5a5d2f9bf4',
            keyTwo: `${user_mock_1.existingUser._id}`,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Unfollowed user now',
        });
    }));
});
//# sourceMappingURL=unfollowUser.test.js.map