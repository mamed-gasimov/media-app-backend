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
exports.getFollowUsers = void 0;
const mongoose_1 = require("mongoose");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const follower_cache_1 = require("../../../shared/services/redis/follower.cache");
const follower_service_1 = require("../../../shared/services/db/follower.service");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const user_cache_1 = require("../../../shared/services/redis/user.cache");
const user_service_1 = require("../../../shared/services/db/user.service");
const followerCache = new follower_cache_1.FollowerCache();
const userCache = new user_cache_1.UserCache();
class GetFollowUsers {
    userFollowings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = new mongoose_1.Types.ObjectId(req.currentUser.userId);
            const cachedFollowees = yield followerCache.getFollowersFromCache(`following:${req.currentUser.userId}`);
            const followings = (cachedFollowees === null || cachedFollowees === void 0 ? void 0 : cachedFollowees.length)
                ? cachedFollowees
                : yield follower_service_1.followerService.getFollowingsData(userObjectId);
            res.status(http_status_codes_1.default.OK).json({ message: 'User followings', followings });
        });
    }
    userFollowers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(userId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            let existingUser = yield userCache.getUserFromCache(userId);
            if (!existingUser) {
                existingUser = (yield user_service_1.userService.findUserById(userId));
                if (!existingUser) {
                    throw new errorHandler_1.BadRequestError('User was not found.');
                }
            }
            const userObjectId = new mongoose_1.Types.ObjectId(userId);
            const cachedFollowers = yield followerCache.getFollowersFromCache(`followers:${userId}`);
            const followers = (cachedFollowers === null || cachedFollowers === void 0 ? void 0 : cachedFollowers.length)
                ? cachedFollowers
                : yield follower_service_1.followerService.getFollowersData(userObjectId);
            res.status(http_status_codes_1.default.OK).json({ message: 'User followers', followers });
        });
    }
}
exports.getFollowUsers = new GetFollowUsers();
//# sourceMappingURL=getFollowUsers.js.map