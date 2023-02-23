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
exports.unfollowUser = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const follower_cache_1 = require("../../../shared/services/redis/follower.cache");
const follower_queue_1 = require("../../../shared/services/queues/follower.queue");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const follower_service_1 = require("../../../shared/services/db/follower.service");
const followerCache = new follower_cache_1.FollowerCache();
class UnfollowUser {
    follower(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { followerId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(followerId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            if (followerId === `${req.currentUser.userId}`) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const followingsList = yield followerCache.getFollowersFromCache(`following:${req.currentUser.userId}`);
            let alreadyFollow = null;
            let alreadyFollowInDb;
            if (followingsList && followingsList.length) {
                alreadyFollow = followingsList.find((item) => String(item._id) === followerId);
            }
            else {
                alreadyFollowInDb = yield follower_service_1.followerService.alreadyFollows(`${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`, followerId);
            }
            if (!alreadyFollow || (!(followingsList === null || followingsList === void 0 ? void 0 : followingsList.length) && !alreadyFollowInDb)) {
                throw new errorHandler_1.BadRequestError('Already not following.');
            }
            const removeFollowerFromCache = followerCache.removeFollowerFromCache(`following:${req.currentUser.userId}`, `${followerId}`);
            const removeFolloweeFromCache = followerCache.removeFollowerFromCache(`followers:${followerId}`, `${req.currentUser.userId}`);
            const followersCount = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', -1);
            const followeeCount = followerCache.updateFollowersCountInCache(`${req.currentUser.userId}`, 'followingCount', -1);
            yield Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeeCount]);
            follower_queue_1.followerQueue.addFollowerJob('removeFollowerFromDb', {
                keyOne: `${followerId}`,
                keyTwo: `${req.currentUser.userId}`,
            });
            res.status(http_status_codes_1.default.OK).json({ message: 'Unfollowed user now' });
        });
    }
}
exports.unfollowUser = new UnfollowUser();
//# sourceMappingURL=unfollowUser.js.map