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
exports.UserCache = void 0;
const lodash_1 = require("lodash");
const errorHandler_1 = require("../../globals/helpers/errorHandler");
const helpers_1 = require("../../globals/helpers/helpers");
const config_1 = require("../../../config");
const base_cache_1 = require("../redis/base.cache");
const log = config_1.config.createLogger('userCache');
class UserCache extends base_cache_1.BaseCache {
    constructor() {
        super('userCache');
    }
    saveUserToCache(key, userId, createdUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdAt = new Date();
            const { _id, uId, username, email, avatarColor, blocked, blockedBy, postsCount, profilePicture, followersCount, followingCount, notifications, work, location, school, quote, bgImageId, bgImageVersion, social, } = createdUser;
            const firstList = [
                '_id',
                `${_id}`,
                'uId',
                `${uId}`,
                'username',
                `${username}`,
                'email',
                `${email}`,
                'avatarColor',
                `${avatarColor}`,
                'createdAt',
                `${createdAt}`,
                'postsCount',
                `${postsCount || 0}`,
            ];
            const secondList = [
                'blocked',
                JSON.stringify(blocked),
                'blockedBy',
                JSON.stringify(blockedBy),
                'profilePicture',
                `${profilePicture}`,
                'followersCount',
                `${followersCount}`,
                'followingCount',
                `${followingCount}`,
                'notifications',
                JSON.stringify(notifications),
                'social',
                JSON.stringify(social),
            ];
            const thirdList = [
                'work',
                `${work}`,
                'location',
                `${location}`,
                'school',
                `${school}`,
                'quote',
                `${quote}`,
                'bgImageVersion',
                `${bgImageVersion}`,
                'bgImageId',
                `${bgImageId}`,
            ];
            const dataToSave = [...firstList, ...secondList, ...thirdList];
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                yield this.client.ZADD('user', { score: parseInt(userId, 10), value: `${key}` });
                yield this.client.HSET(`users:${key}`, dataToSave);
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getUserFromCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const response = (yield this.client.HGETALL(`users:${key}`));
                if (!(response === null || response === void 0 ? void 0 : response.email) || !(response === null || response === void 0 ? void 0 : response._id)) {
                    return null;
                }
                response.createdAt = new Date(helpers_1.Helpers.parseJson(`${response.createdAt || ''}`));
                response.postsCount = helpers_1.Helpers.parseJson(`${response.postsCount || 0}`);
                response.blocked = helpers_1.Helpers.parseJson(`${response.blocked || []}`);
                response.blockedBy = helpers_1.Helpers.parseJson(`${response.blockedBy || []}`);
                response.notifications = helpers_1.Helpers.parseJson(`${response.notifications || ''}`);
                response.social = helpers_1.Helpers.parseJson(`${response.social || ''}`);
                response.followersCount = helpers_1.Helpers.parseJson(`${response.followersCount || 0}`);
                response.followingCount = helpers_1.Helpers.parseJson(`${response.followingCount || 0}`);
                return response;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getUsersFromCache(start, end, excludedUserKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const response = yield this.client.ZRANGE('user', start, end, { REV: true });
                const multi = this.client.multi();
                for (const key of response) {
                    if (key !== excludedUserKey) {
                        multi.HGETALL(`users:${key}`);
                    }
                }
                const replies = (yield multi.exec());
                const userReplies = [];
                for (const reply of replies) {
                    reply.createdAt = new Date(helpers_1.Helpers.parseJson(`${reply.createdAt}`));
                    reply.postsCount = helpers_1.Helpers.parseJson(`${reply.postsCount}`);
                    reply.blocked = helpers_1.Helpers.parseJson(`${reply.blocked}`);
                    reply.blockedBy = helpers_1.Helpers.parseJson(`${reply.blockedBy}`);
                    reply.notifications = helpers_1.Helpers.parseJson(`${reply.notifications}`);
                    reply.social = helpers_1.Helpers.parseJson(`${reply.social}`);
                    reply.followersCount = helpers_1.Helpers.parseJson(`${reply.followersCount}`);
                    reply.followingCount = helpers_1.Helpers.parseJson(`${reply.followingCount}`);
                    reply.bgImageId = helpers_1.Helpers.parseJson(`${reply.bgImageId}`);
                    reply.bgImageVersion = helpers_1.Helpers.parseJson(`${reply.bgImageVersion}`);
                    reply.profilePicture = helpers_1.Helpers.parseJson(`${reply.profilePicture}`);
                    reply.work = helpers_1.Helpers.parseJson(`${reply.work}`);
                    reply.school = helpers_1.Helpers.parseJson(`${reply.school}`);
                    reply.location = helpers_1.Helpers.parseJson(`${reply.location}`);
                    reply.quote = helpers_1.Helpers.parseJson(`${reply.quote}`);
                    userReplies.push(reply);
                }
                return userReplies;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    updateSingleUserItemInCache(userId, prop, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const val = typeof value === 'string' ? value : JSON.stringify(value);
                const dataToSave = [`${prop}`, val];
                yield this.client.HSET(`users:${userId}`, dataToSave);
                const response = (yield this.getUserFromCache(userId));
                return response;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getTotalUsersInCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const count = yield this.client.ZCARD('user');
                return count;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getRandomUsersFromCache(userId, excludedUsername) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const replies = [];
                const followers = yield this.client.LRANGE(`followers:${userId}`, 0, -1);
                const users = yield this.client.ZRANGE('user', 0, -1);
                const randomUsers = (_a = helpers_1.Helpers.shuffle(users)) === null || _a === void 0 ? void 0 : _a.slice(0, 10);
                for (const key of randomUsers) {
                    const followerIndex = followers.indexOf(key);
                    if (followerIndex < 0) {
                        const userHash = (yield this.client.HGETALL(`users:${key}`));
                        replies.push(userHash);
                    }
                }
                const excludedUsernameIndex = (0, lodash_1.findIndex)(replies, ['username', excludedUsername]);
                replies.splice(excludedUsernameIndex, 1);
                for (const reply of replies) {
                    reply.createdAt = new Date(helpers_1.Helpers.parseJson(`${reply.createdAt}`));
                    reply.postsCount = helpers_1.Helpers.parseJson(`${reply.postsCount}`);
                    reply.blocked = helpers_1.Helpers.parseJson(`${reply.blocked}`);
                    reply.blockedBy = helpers_1.Helpers.parseJson(`${reply.blockedBy}`);
                    reply.notifications = helpers_1.Helpers.parseJson(`${reply.notifications}`);
                    reply.social = helpers_1.Helpers.parseJson(`${reply.social}`);
                    reply.followersCount = helpers_1.Helpers.parseJson(`${reply.followersCount}`);
                    reply.followingCount = helpers_1.Helpers.parseJson(`${reply.followingCount}`);
                    reply.bgImageId = helpers_1.Helpers.parseJson(`${reply.bgImageId}`);
                    reply.bgImageVersion = helpers_1.Helpers.parseJson(`${reply.bgImageVersion}`);
                    reply.profilePicture = helpers_1.Helpers.parseJson(`${reply.profilePicture}`);
                    reply.work = helpers_1.Helpers.parseJson(`${reply.work}`);
                    reply.school = helpers_1.Helpers.parseJson(`${reply.school}`);
                    reply.location = helpers_1.Helpers.parseJson(`${reply.location}`);
                    reply.quote = helpers_1.Helpers.parseJson(`${reply.quote}`);
                }
                return replies;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
}
exports.UserCache = UserCache;
//# sourceMappingURL=user.cache.js.map