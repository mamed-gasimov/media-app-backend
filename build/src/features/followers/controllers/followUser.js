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
exports.followUser = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = require("mongoose");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const follower_cache_1 = require("../../../shared/services/redis/follower.cache");
const user_cache_1 = require("../../../shared/services/redis/user.cache");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const user_service_1 = require("../../../shared/services/db/user.service");
const follower_sockets_1 = require("../../../shared/sockets/follower.sockets");
const follower_queue_1 = require("../../../shared/services/queues/follower.queue");
const follower_service_1 = require("../../../shared/services/db/follower.service");
const followerCache = new follower_cache_1.FollowerCache();
const userCache = new user_cache_1.UserCache();
class FollowUser {
    follower(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { followerId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(followerId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            if (followerId === `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const followingsList = yield followerCache.getFollowersFromCache(`following:${req.currentUser.userId}`);
            let alreadyFollow;
            if (followingsList && followingsList.length) {
                alreadyFollow = followingsList.find((item) => String(item._id) === followerId);
            }
            else {
                alreadyFollow = yield follower_service_1.followerService.alreadyFollows(`${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.userId}`, followerId);
            }
            if (alreadyFollow) {
                throw new errorHandler_1.BadRequestError('Already following.');
            }
            let follower = yield userCache.getUserFromCache(followerId);
            if (!follower) {
                follower = (yield user_service_1.userService.findUserById(followerId));
                if (!follower) {
                    throw new errorHandler_1.BadRequestError('User was not found');
                }
            }
            const followersCount = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
            const followeeCount = followerCache.updateFollowersCountInCache(`${req.currentUser.userId}`, 'followingCount', 1);
            yield Promise.all([followersCount, followeeCount]);
            const followerObjectId = new mongodb_1.ObjectId();
            const addFolloweeData = FollowUser.prototype.userData(follower);
            follower_sockets_1.socketIOFollowerObject.emit('add follower', addFolloweeData);
            const addFollowerToCache = followerCache.saveFollowerToCache(`following:${req.currentUser.userId}`, `${followerId}`);
            const addFolloweeToCache = followerCache.saveFollowerToCache(`followers:${followerId}`, `${req.currentUser.userId}`);
            yield Promise.all([addFollowerToCache, addFolloweeToCache]);
            follower_queue_1.followerQueue.addFollowerJob('addFollowerToDb', {
                keyOne: `${req.currentUser.userId}`,
                keyTwo: `${followerId}`,
                username: req.currentUser.username,
                followerDocumentId: followerObjectId,
            });
            res.status(http_status_codes_1.default.OK).json({ message: 'Following user now' });
        });
    }
    userData(user) {
        return {
            _id: new mongoose_1.Types.ObjectId(user._id),
            username: user.username,
            avatarColor: user.avatarColor,
            postCount: user.postsCount,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            profilePicture: user.profilePicture,
            uId: user.uId,
            userProfile: user,
        };
    }
}
exports.followUser = new FollowUser();
//# sourceMappingURL=followUser.js.map