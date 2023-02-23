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
const mongoose_1 = require("mongoose");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const followers_mock_1 = require("../../../../mocks/followers.mock");
const follower_cache_1 = require("../../../../shared/services/redis/follower.cache");
const getFollowUsers_1 = require("../../controllers/getFollowUsers");
const follower_service_1 = require("../../../../shared/services/db/follower.service");
const user_mock_1 = require("../../../../mocks/user.mock");
const user_service_1 = require("../../../../shared/services/db/user.service");
const user_cache_1 = require("../../../../shared/services/redis/user.cache");
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
        it('should send correct json response if user following exist in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload);
            const res = (0, followers_mock_1.followersMockResponse)();
            jest.spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([followers_mock_1.mockFollowerData]);
            yield getFollowUsers_1.getFollowUsers.userFollowings(req, res);
            expect(follower_cache_1.FollowerCache.prototype.getFollowersFromCache).toBeCalledWith(`following:${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followings',
                followings: [followers_mock_1.mockFollowerData],
            });
        }));
        it('should send correct json response if user following exist in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload);
            const res = (0, followers_mock_1.followersMockResponse)();
            jest.spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
            jest.spyOn(follower_service_1.followerService, 'getFollowingsData').mockResolvedValue([followers_mock_1.mockFollowerData]);
            yield getFollowUsers_1.getFollowUsers.userFollowings(req, res);
            expect(follower_service_1.followerService.getFollowingsData).toHaveBeenCalledWith(new mongoose_1.Types.ObjectId(req.currentUser.userId));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followings',
                followings: [followers_mock_1.mockFollowerData],
            });
        }));
        it('should return empty following if user following does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload);
            const res = (0, followers_mock_1.followersMockResponse)();
            jest.spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
            jest.spyOn(follower_service_1.followerService, 'getFollowingsData').mockResolvedValue([]);
            yield getFollowUsers_1.getFollowUsers.userFollowings(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followings',
                followings: [],
            });
        }));
    });
    describe('userFollowers', () => {
        it('should throw an error if userId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            getFollowUsers_1.getFollowUsers.userFollowers(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if userId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '12345',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            getFollowUsers_1.getFollowUsers.userFollowers(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if user was not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '6064861bc25eaa5a5d2f9bf4',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockImplementation(() => Promise.resolve({
                social: '',
                notifications: '',
            }));
            jest.spyOn(user_service_1.userService, 'findUserById').mockImplementation(() => Promise.resolve(null));
            getFollowUsers_1.getFollowUsers.userFollowers(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('User was not found.');
            });
        }));
        it('should send correct json response if user follower exist in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: `${user_mock_1.existingUserTwo._id}`,
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockImplementation(() => Promise.resolve({
                social: {},
                notifications: {},
            }));
            jest.spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([followers_mock_1.mockFollowerData]);
            yield getFollowUsers_1.getFollowUsers.userFollowers(req, res);
            expect(follower_cache_1.FollowerCache.prototype.getFollowersFromCache).toBeCalledWith(`followers:${req.params.userId}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followers',
                followers: [followers_mock_1.mockFollowerData],
            });
        }));
        it('should send correct json response if user following exist in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: `${user_mock_1.existingUserTwo._id}`,
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockImplementation(() => Promise.resolve({
                social: {},
                notifications: {},
            }));
            jest.spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
            jest.spyOn(follower_service_1.followerService, 'getFollowersData').mockResolvedValue([followers_mock_1.mockFollowerData]);
            yield getFollowUsers_1.getFollowUsers.userFollowers(req, res);
            expect(follower_service_1.followerService.getFollowersData).toHaveBeenCalledWith(new mongoose_1.Types.ObjectId(req.params.userId));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followers',
                followers: [followers_mock_1.mockFollowerData],
            });
        }));
        it('should return empty following if user following does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: `${user_mock_1.existingUserTwo._id}`,
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockImplementation(() => Promise.resolve({
                social: {},
                notifications: {},
            }));
            jest.spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
            jest.spyOn(follower_service_1.followerService, 'getFollowersData').mockResolvedValue([]);
            yield getFollowUsers_1.getFollowUsers.userFollowers(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User followers',
                followers: [],
            });
        }));
    });
});
//# sourceMappingURL=getFollowUsers.test.js.map