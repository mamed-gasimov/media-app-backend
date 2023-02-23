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
exports.FollowerCache = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../../../config");
const errorHandler_1 = require("../../globals/helpers/errorHandler");
const base_cache_1 = require("../redis/base.cache");
const user_cache_1 = require("../redis/user.cache");
const log = config_1.config.createLogger('followersCache');
const userCache = new user_cache_1.UserCache();
class FollowerCache extends base_cache_1.BaseCache {
    constructor() {
        super('followersCache');
    }
    saveFollowerToCache(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                yield this.client.LPUSH(key, value);
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    removeFollowerFromCache(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                yield this.client.LREM(key, 1, value);
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    updateFollowersCountInCache(userId, prop, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                let incValue = value;
                if (value === -1) {
                    const countStr = yield this.client.HMGET(`users:${userId}`, prop);
                    const count = Number(countStr[0]);
                    if (count === 0) {
                        incValue = 0;
                    }
                }
                yield this.client.HINCRBY(`users:${userId}`, prop, incValue);
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getFollowersFromCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const response = yield this.client.LRANGE(key, 0, -1);
                const list = [];
                for (const item of response) {
                    const user = yield userCache.getUserFromCache(item);
                    if (!user) {
                        return null;
                    }
                    const data = {
                        _id: new mongoose_1.default.Types.ObjectId(user._id),
                        username: user.username,
                        avatarColor: user.avatarColor,
                        postCount: user.postsCount,
                        followersCount: user.followersCount,
                        followingCount: user.followingCount,
                        profilePicture: user.profilePicture,
                        uId: user.uId,
                        userProfile: user,
                    };
                    list.push(data);
                }
                return list;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
}
exports.FollowerCache = FollowerCache;
//# sourceMappingURL=follower.cache.js.map