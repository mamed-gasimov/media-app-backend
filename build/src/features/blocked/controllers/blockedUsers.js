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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockedUsers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const blockedUsers_queue_1 = require("../../../shared/services/queues/blockedUsers.queue");
const blockedUsers_cache_1 = require("../../../shared/services/redis/blockedUsers.cache");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const follower_cache_1 = require("../../../shared/services/redis/follower.cache");
const follower_service_1 = require("../../../shared/services/db/follower.service");
const follower_queue_1 = require("../../../shared/services/queues/follower.queue");
const user_cache_1 = require("../../../shared/services/redis/user.cache");
const user_service_1 = require("../../../shared/services/db/user.service");
const blockedUsersCache = new blockedUsers_cache_1.BlockedUsersCache();
const followerCache = new follower_cache_1.FollowerCache();
const userCache = new user_cache_1.UserCache();
class BlockedUsers {
    block(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(userId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            if (userId === `${req.currentUser.userId}`) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            let existingUser = yield userCache.getUserFromCache(userId);
            if (!existingUser || (!existingUser.social && !existingUser.notifications)) {
                existingUser = (yield user_service_1.userService.findUserById(userId));
                if (!existingUser) {
                    throw new errorHandler_1.BadRequestError('User was not found.');
                }
            }
            const alreadyBlocked = (_a = existingUser === null || existingUser === void 0 ? void 0 : existingUser.blockedBy) === null || _a === void 0 ? void 0 : _a.find((id) => String(id) === req.currentUser.userId);
            if (alreadyBlocked) {
                throw new errorHandler_1.BadRequestError('User was already blocked.');
            }
            yield BlockedUsers.prototype.updateBlockedUser(userId, req.currentUser.userId, 'block');
            blockedUsers_queue_1.blockedUsersQueue.addBlockedUsersJob('addBlockedUserToDb', {
                keyOne: `${req.currentUser.userId}`,
                keyTwo: `${userId}`,
                type: 'block',
            });
            yield BlockedUsers.prototype.checkFollowingsBlockedUser(req.currentUser.userId, userId);
            yield BlockedUsers.prototype.checkFollowingsBlockedUser(userId, req.currentUser.userId);
            res.status(http_status_codes_1.default.OK).json({ message: 'User blocked' });
        });
    }
    unblock(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(userId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            if (userId === `${req.currentUser.userId}`) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            let existingUser = yield userCache.getUserFromCache(userId);
            if (!existingUser || (!existingUser.social && !existingUser.notifications)) {
                existingUser = (yield user_service_1.userService.findUserById(userId));
                if (!existingUser) {
                    throw new errorHandler_1.BadRequestError('User was not found.');
                }
            }
            const alreadyBlocked = (_a = existingUser === null || existingUser === void 0 ? void 0 : existingUser.blockedBy) === null || _a === void 0 ? void 0 : _a.find((id) => String(id) === req.currentUser.userId);
            if (!alreadyBlocked) {
                throw new errorHandler_1.BadRequestError('Already not blocked.');
            }
            yield BlockedUsers.prototype.updateBlockedUser(userId, req.currentUser.userId, 'unblock');
            blockedUsers_queue_1.blockedUsersQueue.addBlockedUsersJob('removeBlockedUserFromDb', {
                keyOne: `${req.currentUser.userId}`,
                keyTwo: `${userId}`,
                type: 'unblock',
            });
            res.status(http_status_codes_1.default.OK).json({ message: 'User unblocked' });
        });
    }
    updateBlockedUser(key, userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const blocked = blockedUsersCache.updateBlockedUserPropInCache(`${userId}`, 'blocked', `${key}`, type);
            const blockedBy = blockedUsersCache.updateBlockedUserPropInCache(`${key}`, 'blockedBy', `${userId}`, type);
            yield Promise.all([blocked, blockedBy]);
        });
    }
    checkFollowingsBlockedUser(firstUserId, secondUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const followingsList = yield followerCache.getFollowersFromCache(`following:${firstUserId}`);
            let alreadyFollow = null;
            let alreadyFollowInDb;
            if (followingsList && followingsList.length) {
                alreadyFollow = followingsList === null || followingsList === void 0 ? void 0 : followingsList.find((item) => String(item._id) === secondUserId);
            }
            else {
                alreadyFollowInDb = yield follower_service_1.followerService.alreadyFollows(`${firstUserId}`, secondUserId);
            }
            if (alreadyFollow || (!(followingsList === null || followingsList === void 0 ? void 0 : followingsList.length) && alreadyFollowInDb)) {
                yield BlockedUsers.prototype.unfollowBlockedUser(firstUserId, secondUserId);
            }
        });
    }
    unfollowBlockedUser(firstUserId, secondUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const removeFollowerFromCache = followerCache.removeFollowerFromCache(`following:${firstUserId}`, `${secondUserId}`);
            const removeFolloweeFromCache = followerCache.removeFollowerFromCache(`followers:${secondUserId}`, `${firstUserId}`);
            const followersCount = followerCache.updateFollowersCountInCache(`${secondUserId}`, 'followersCount', -1);
            const followeeCount = followerCache.updateFollowersCountInCache(`${firstUserId}`, 'followingCount', -1);
            yield Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeeCount]);
            follower_queue_1.followerQueue.addFollowerJob('removeFollowerFromDb', {
                keyOne: `${secondUserId}`,
                keyTwo: `${firstUserId}`,
            });
        });
    }
}
exports.blockedUsers = new BlockedUsers();
//# sourceMappingURL=blockedUsers.js.map