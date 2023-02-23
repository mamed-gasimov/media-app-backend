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
const auth_mock_1 = require("../../../../mocks/auth.mock");
const user_cache_1 = require("../../../../shared/services/redis/user.cache");
const follower_cache_1 = require("../../../../shared/services/redis/follower.cache");
const user_mock_1 = require("../../../../mocks/user.mock");
const getUserProfiles_1 = require("../../controllers/getUserProfiles");
const post_cache_1 = require("../../../../shared/services/redis/post.cache");
const post_mock_1 = require("../../../../mocks/post.mock");
const followers_mock_1 = require("../../../../mocks/followers.mock");
const user_service_1 = require("../../../../shared/services/db/user.service");
const post_service_1 = require("../../../../shared/services/db/post.service");
const helpers_1 = require("../../../../shared/globals/helpers/helpers");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');
jest.mock('@service/redis/follower.cache');
jest.mock('@service/redis/user.cache');
jest.mock('@service/db/user.service');
jest.mock('@service/db/follower.service');
describe('Get User Profiles', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.clearAllMocks();
        jest.clearAllTimers();
    }));
    describe('all', () => {
        it('should send success json response if users in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, auth_mock_1.authMockRequest)({}, { page: 1, pageSize: 1 }, auth_mock_1.authUserPayload);
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUsersFromCache').mockResolvedValue([user_mock_1.existingUser]);
            jest.spyOn(user_cache_1.UserCache.prototype, 'getTotalUsersInCache').mockResolvedValue(1);
            jest.spyOn(follower_cache_1.FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([followers_mock_1.mockFollowerData]);
            yield getUserProfiles_1.getUserProfiles.all(req, res);
            expect(follower_cache_1.FollowerCache.prototype.getFollowersFromCache).toHaveBeenCalledWith(`followers:${req.currentUser.userId}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get users',
                users: [user_mock_1.existingUser],
                followers: [followers_mock_1.mockFollowerData],
                totalUsers: 1,
            });
        }));
    });
    describe('profile', () => {
        it('should send success json response if user in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const req = (0, auth_mock_1.authMockRequest)({}, {}, auth_mock_1.authUserPayload);
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(user_mock_1.existingUser);
            yield getUserProfiles_1.getUserProfiles.currentUserProfile(req, res);
            expect(user_cache_1.UserCache.prototype.getUserFromCache).toHaveBeenCalledWith(`${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get user profile',
                user: user_mock_1.existingUser,
            });
        }));
        it('should send success json response if user in database', () => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            const req = (0, auth_mock_1.authMockRequest)({}, {}, auth_mock_1.authUserPayload);
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(null);
            jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(user_mock_1.existingUser);
            yield getUserProfiles_1.getUserProfiles.currentUserProfile(req, res);
            expect(user_service_1.userService.getUserById).toHaveBeenCalledWith(`${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.userId}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get user profile',
                user: user_mock_1.existingUser,
            });
        }));
    });
    describe('profileAndPosts', () => {
        it('should send success json response if user in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const req = (0, auth_mock_1.authMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                username: user_mock_1.existingUser.username,
                userId: user_mock_1.existingUser._id,
                uId: user_mock_1.existingUser.uId,
            });
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(user_mock_1.existingUser);
            jest.spyOn(post_cache_1.PostCache.prototype, 'getUserPostsFromCache').mockResolvedValue([post_mock_1.postMockData]);
            yield getUserProfiles_1.getUserProfiles.profileAndPosts(req, res);
            expect(user_cache_1.UserCache.prototype.getUserFromCache).toHaveBeenCalledWith(`${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`);
            expect(post_cache_1.PostCache.prototype.getUserPostsFromCache).toHaveBeenCalledWith('post', parseInt(req.params.uId, 10));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get user profile and posts',
                user: user_mock_1.existingUser,
                posts: [post_mock_1.postMockData],
            });
        }));
        it('should send success json response if user in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, auth_mock_1.authMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                username: user_mock_1.existingUser.username,
                userId: user_mock_1.existingUser._id,
                uId: user_mock_1.existingUser.uId,
            });
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(null);
            jest.spyOn(post_cache_1.PostCache.prototype, 'getUserPostsFromCache').mockResolvedValue([]);
            jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(user_mock_1.existingUser);
            jest.spyOn(post_service_1.postService, 'getPosts').mockResolvedValue([post_mock_1.postMockData]);
            const userName = helpers_1.Helpers.firstLetterUpperCase(req.params.username);
            yield getUserProfiles_1.getUserProfiles.profileAndPosts(req, res);
            expect(user_service_1.userService.getUserById).toHaveBeenCalledWith(user_mock_1.existingUser._id);
            expect(post_service_1.postService.getPosts).toHaveBeenCalledWith({ username: userName }, 0, 100, { createdAt: -1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get user profile and posts',
                user: user_mock_1.existingUser,
                posts: [post_mock_1.postMockData],
            });
        }));
    });
    describe('profileByUserId', () => {
        it('should send success json response if user in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, auth_mock_1.authMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                userId: user_mock_1.existingUser._id,
            });
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(user_mock_1.existingUser);
            yield getUserProfiles_1.getUserProfiles.profileByUserId(req, res);
            expect(user_cache_1.UserCache.prototype.getUserFromCache).toHaveBeenCalledWith(req.params.userId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get user profile by id',
                user: user_mock_1.existingUser,
            });
        }));
        it('should send success json response if user in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, auth_mock_1.authMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                userId: user_mock_1.existingUser._id,
            });
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(null);
            jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(user_mock_1.existingUser);
            yield getUserProfiles_1.getUserProfiles.profileByUserId(req, res);
            expect(user_service_1.userService.getUserById).toHaveBeenCalledWith(req.params.userId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Get user profile by id',
                user: user_mock_1.existingUser,
            });
        }));
    });
    describe('randomUserSuggestions', () => {
        it('should send success json response if user in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const req = (0, auth_mock_1.authMockRequest)({}, {}, auth_mock_1.authUserPayload);
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getRandomUsersFromCache').mockResolvedValue([user_mock_1.existingUser]);
            yield getUserProfiles_1.getUserProfiles.randomUserSuggestions(req, res);
            expect(user_cache_1.UserCache.prototype.getRandomUsersFromCache).toHaveBeenCalledWith(`${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`, `${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.username}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User suggestions',
                users: [user_mock_1.existingUser],
            });
        }));
        it('should send success json response if user in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, auth_mock_1.authMockRequest)({}, {}, auth_mock_1.authUserPayload);
            const res = (0, auth_mock_1.authMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'getRandomUsersFromCache').mockResolvedValue([]);
            jest.spyOn(user_service_1.userService, 'getRandomUsers').mockResolvedValue([user_mock_1.existingUser]);
            yield getUserProfiles_1.getUserProfiles.randomUserSuggestions(req, res);
            expect(user_service_1.userService.getRandomUsers).toHaveBeenCalledWith(req.currentUser.userId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User suggestions',
                users: [user_mock_1.existingUser],
            });
        }));
    });
});
//# sourceMappingURL=getUserProfiles.test.js.map