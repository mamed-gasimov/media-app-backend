"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const socket_io_1 = require("socket.io");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const followerServer = __importStar(require("../../../../shared/sockets/follower.sockets"));
const followers_mock_1 = require("../../../../mocks/followers.mock");
const user_mock_1 = require("../../../../mocks/user.mock");
const follower_queue_1 = require("../../../../shared/services/queues/follower.queue");
const followUser_1 = require("../../controllers/followUser");
const user_cache_1 = require("../../../../shared/services/redis/user.cache");
const follower_cache_1 = require("../../../../shared/services/redis/follower.cache");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/redis/follower.cache');
Object.defineProperties(followerServer, {
    socketIOFollowerObject: {
        value: new socket_io_1.Server(),
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
    it('should throw an error if followerId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
            followerId: '',
        });
        const res = (0, followers_mock_1.followersMockResponse)();
        followUser_1.followUser.follower(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if followerId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
            followerId: '12345',
        });
        const res = (0, followers_mock_1.followersMockResponse)();
        followUser_1.followUser.follower(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should call updateFollowersCountInCache', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
            followerId: '6064861bc25eaa5a5d2f9bf4',
        });
        const res = (0, followers_mock_1.followersMockResponse)();
        jest
            .spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache')
            .mockImplementation(() => Promise.resolve([{ _id: '12345' }]));
        jest.spyOn(follower_cache_1.FollowerCache.prototype, 'updateFollowersCountInCache');
        jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(user_mock_1.existingUser);
        yield followUser_1.followUser.follower(req, res);
        expect(follower_cache_1.FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledTimes(2);
        expect(follower_cache_1.FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith('6064861bc25eaa5a5d2f9bf4', 'followersCount', 1);
        expect(follower_cache_1.FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith(`${user_mock_1.existingUser._id}`, 'followingCount', 1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Following user now',
        });
    }));
    it('should call saveFollowerToCache', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
            followerId: '6064861bc25eaa5a5d2f9bf4',
        });
        const res = (0, followers_mock_1.followersMockResponse)();
        jest
            .spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache')
            .mockImplementation(() => Promise.resolve([{ _id: '12345' }]));
        jest.spyOn(followerServer.socketIOFollowerObject, 'emit');
        jest.spyOn(follower_cache_1.FollowerCache.prototype, 'saveFollowerToCache');
        jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(user_mock_1.existingUser);
        yield followUser_1.followUser.follower(req, res);
        expect(user_cache_1.UserCache.prototype.getUserFromCache).toHaveBeenCalledTimes(1);
        expect(follower_cache_1.FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledTimes(2);
        expect(follower_cache_1.FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(`following:${req.currentUser.userId}`, '6064861bc25eaa5a5d2f9bf4');
        expect(follower_cache_1.FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith('followers:6064861bc25eaa5a5d2f9bf4', `${user_mock_1.existingUser._id}`);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Following user now',
        });
    }));
    it('should call followerQueue addFollowerJob', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
            followerId: '6064861bc25eaa5a5d2f9bf4',
        });
        const res = (0, followers_mock_1.followersMockResponse)();
        jest
            .spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache')
            .mockImplementation(() => Promise.resolve([{ _id: '12345' }]));
        const spy = jest.spyOn(follower_queue_1.followerQueue, 'addFollowerJob');
        yield followUser_1.followUser.follower(req, res);
        expect(follower_queue_1.followerQueue.addFollowerJob).toHaveBeenCalledWith('addFollowerToDb', {
            keyOne: `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`,
            keyTwo: '6064861bc25eaa5a5d2f9bf4',
            username: (_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.username,
            followerDocumentId: spy.mock.calls[0][1].followerDocumentId,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Following user now',
        });
    }));
});
//# sourceMappingURL=followUser.test.js.map