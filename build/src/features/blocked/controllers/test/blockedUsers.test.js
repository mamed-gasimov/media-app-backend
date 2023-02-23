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
const blockedUsers_1 = require("../../controllers/blockedUsers");
const blockedUsers_queue_1 = require("../../../../shared/services/queues/blockedUsers.queue");
const blockedUsers_cache_1 = require("../../../../shared/services/redis/blockedUsers.cache");
const user_cache_1 = require("../../../../shared/services/redis/user.cache");
const follower_cache_1 = require("../../../../shared/services/redis/follower.cache");
const user_service_1 = require("../../../../shared/services/db/user.service");
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
        it('should throw an error if userId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            blockedUsers_1.blockedUsers.block(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if userId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '12345',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            blockedUsers_1.blockedUsers.block(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if userId is equal to current userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '6064861bc25eaa5a5d2f9bf4',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            req.params.userId = req.currentUser.userId;
            blockedUsers_1.blockedUsers.block(req, res).catch((error) => {
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
            blockedUsers_1.blockedUsers.block(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('User was not found.');
            });
        }));
        it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, { userId: '6064861bc25eaa5a5d2f9bf4' });
            const res = (0, followers_mock_1.followersMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockImplementation(() => Promise.resolve({
                social: {},
                notifications: {},
            }));
            jest.spyOn(blockedUsers_cache_1.BlockedUsersCache.prototype, 'updateBlockedUserPropInCache');
            jest.spyOn(blockedUsers_queue_1.blockedUsersQueue, 'addBlockedUsersJob');
            jest
                .spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache')
                .mockImplementation(() => Promise.resolve([{}]));
            yield blockedUsers_1.blockedUsers.block(req, res);
            expect(blockedUsers_cache_1.BlockedUsersCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith('6064861bc25eaa5a5d2f9bf4', 'blockedBy', `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`, 'block');
            expect(blockedUsers_cache_1.BlockedUsersCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(`${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.userId}`, 'blocked', '6064861bc25eaa5a5d2f9bf4', 'block');
            expect(blockedUsers_queue_1.blockedUsersQueue.addBlockedUsersJob).toHaveBeenCalledWith('addBlockedUserToDb', {
                keyOne: `${(_c = req.currentUser) === null || _c === void 0 ? void 0 : _c.userId}`,
                keyTwo: '6064861bc25eaa5a5d2f9bf4',
                type: 'block',
            });
            expect(follower_cache_1.FollowerCache.prototype.getFollowersFromCache).toHaveBeenCalledWith(`following:${req.currentUser.userId}`);
            expect(follower_cache_1.FollowerCache.prototype.getFollowersFromCache).toHaveBeenCalledWith('following:6064861bc25eaa5a5d2f9bf4');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User blocked',
            });
        }));
    });
    describe('unblock', () => {
        it('should throw an error if userId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            blockedUsers_1.blockedUsers.block(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if userId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '12345',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            blockedUsers_1.blockedUsers.block(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if userId is equal to current userId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '6064861bc25eaa5a5d2f9bf4',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            req.params.userId = req.currentUser.userId;
            blockedUsers_1.blockedUsers.block(req, res).catch((error) => {
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
            blockedUsers_1.blockedUsers.block(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('User was not found.');
            });
        }));
        it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const req = (0, followers_mock_1.followersMockRequest)({}, auth_mock_1.authUserPayload, {
                userId: '6064861bc25eaa5a5d2f9bf4',
            });
            const res = (0, followers_mock_1.followersMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockImplementation(() => Promise.resolve({
                social: {},
                notifications: {},
                blockedBy: [req.currentUser.userId],
            }));
            jest.spyOn(blockedUsers_cache_1.BlockedUsersCache.prototype, 'updateBlockedUserPropInCache');
            jest.spyOn(blockedUsers_queue_1.blockedUsersQueue, 'addBlockedUsersJob');
            yield blockedUsers_1.blockedUsers.unblock(req, res);
            expect(blockedUsers_cache_1.BlockedUsersCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith('6064861bc25eaa5a5d2f9bf4', 'blockedBy', `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`, 'unblock');
            expect(blockedUsers_cache_1.BlockedUsersCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(`${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.userId}`, 'blocked', '6064861bc25eaa5a5d2f9bf4', 'unblock');
            expect(blockedUsers_queue_1.blockedUsersQueue.addBlockedUsersJob).toHaveBeenCalledWith('removeBlockedUserFromDb', {
                keyOne: `${(_c = req.currentUser) === null || _c === void 0 ? void 0 : _c.userId}`,
                keyTwo: '6064861bc25eaa5a5d2f9bf4',
                type: 'unblock',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User unblocked',
            });
        }));
    });
});
//# sourceMappingURL=blockedUsers.test.js.map