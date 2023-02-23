"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfiles = void 0;
const mongoose_1 = require("mongoose");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const follower_cache_1 = require("../../../shared/services/redis/follower.cache");
const post_cache_1 = require("../../../shared/services/redis/post.cache");
const user_cache_1 = require("../../../shared/services/redis/user.cache");
const user_service_1 = require("../../../shared/services/db/user.service");
const follower_service_1 = require("../../../shared/services/db/follower.service");
const post_service_1 = require("../../../shared/services/db/post.service");
const userInfo_1 = require("../schemas/userInfo");
const postCache = new post_cache_1.PostCache();
const userCache = new user_cache_1.UserCache();
const followerCache = new follower_cache_1.FollowerCache();
class GetUserProfiles {
    all(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, pageSize } = req.body;
            const skip = (page - 1) * pageSize;
            const limit = pageSize * page;
            const newSkip = skip === 0 ? skip : skip + 1;
            const allUsers = yield GetUserProfiles.prototype.allUsers({
                newSkip,
                limit,
                skip,
                userId: `${req.currentUser.userId}`,
            });
            const followers = yield GetUserProfiles.prototype.followers(`${req.currentUser.userId}`);
            res
                .status(http_status_codes_1.default.OK)
                .json({ message: 'Get users', users: allUsers.users, totalUsers: allUsers.totalUsers, followers });
        });
    }
    currentUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedUser = (yield userCache.getUserFromCache(`${req.currentUser.userId}`));
            const existingUser = cachedUser
                ? cachedUser
                : yield user_service_1.userService.getUserById(`${req.currentUser.userId}`);
            res.status(http_status_codes_1.default.OK).json({ message: 'Get user profile', user: existingUser });
        });
    }
    profileByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(userId)) {
                throw new errorHandler_1.BadRequestError('Invalid request');
            }
            const cachedUser = yield userCache.getUserFromCache(userId);
            const existingUser = cachedUser || (yield user_service_1.userService.getUserById(userId));
            if (!existingUser) {
                throw new errorHandler_1.BadRequestError('User was not found');
            }
            res
                .status(http_status_codes_1.default.OK)
                .json({ message: 'Get user profile by id', user: existingUser });
        });
    }
    profileAndPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(userId)) {
                throw new errorHandler_1.BadRequestError('Invalid request');
            }
            const cachedUser = yield userCache.getUserFromCache(userId);
            const existingUser = cachedUser || (yield user_service_1.userService.getUserById(userId));
            if (!existingUser) {
                throw new errorHandler_1.BadRequestError('User was not found');
            }
            const userName = helpers_1.Helpers.firstLetterUpperCase(existingUser.username);
            const cachedUserPosts = yield postCache.getUserPostsFromCache('post', parseInt(existingUser.uId, 10));
            const userPosts = cachedUserPosts.length
                ? cachedUserPosts
                : yield post_service_1.postService.getPosts({ username: userName }, 0, 100, { createdAt: -1 });
            res
                .status(http_status_codes_1.default.OK)
                .json({ message: 'Get user profile and posts', user: existingUser, posts: userPosts });
        });
    }
    randomUserSuggestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let randomUsers = [];
            const cachedUsers = yield userCache.getRandomUsersFromCache(`${req.currentUser.userId}`, req.currentUser.username);
            if (cachedUsers.length) {
                randomUsers = [...cachedUsers];
            }
            else {
                const users = yield user_service_1.userService.getRandomUsers(req.currentUser.userId);
                randomUsers = [...users];
            }
            res.status(http_status_codes_1.default.OK).json({ message: 'User suggestions', users: randomUsers });
        });
    }
    allUsers({ newSkip, limit, skip, userId }) {
        return __awaiter(this, void 0, void 0, function* () {
            let users;
            let type = '';
            const cachedUsers = (yield userCache.getUsersFromCache(newSkip, limit, userId));
            if (cachedUsers.length) {
                type = 'redis';
                users = cachedUsers;
            }
            else {
                type = 'mongodb';
                users = yield user_service_1.userService.getAllUsers(userId, skip, limit);
            }
            const totalUsers = yield GetUserProfiles.prototype.usersCount(type);
            return { users, totalUsers };
        });
    }
    usersCount(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalUsers = type === 'redis' ? yield userCache.getTotalUsersInCache() : yield user_service_1.userService.getTotalUsersInDb();
            return totalUsers;
        });
    }
    followers(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedFollowers = yield followerCache.getFollowersFromCache(`followers:${userId}`);
            if (!cachedFollowers || !(cachedFollowers === null || cachedFollowers === void 0 ? void 0 : cachedFollowers.length)) {
                return null;
            }
            const result = cachedFollowers.length
                ? cachedFollowers
                : yield follower_service_1.followerService.getFollowersData(new mongoose_1.Types.ObjectId(userId));
            return result;
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(userInfo_1.getUsersSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GetUserProfiles.prototype, "all", null);
exports.getUserProfiles = new GetUserProfiles();
//# sourceMappingURL=getUserProfiles.js.map