"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followerRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
const followUser_1 = require("../controllers/followUser");
const unfollowUser_1 = require("../controllers/unfollowUser");
const getFollowUsers_1 = require("../controllers/getFollowUsers");
class FollowerRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.get('/user/followings', authMiddleware_1.authMiddleware.checkAuthentication, getFollowUsers_1.getFollowUsers.userFollowings);
        this.router.get('/user/followers/:userId', authMiddleware_1.authMiddleware.checkAuthentication, getFollowUsers_1.getFollowUsers.userFollowers);
        this.router.put('/user/follow/:followerId', authMiddleware_1.authMiddleware.checkAuthentication, followUser_1.followUser.follower);
        this.router.put('/user/unfollow/:followerId', authMiddleware_1.authMiddleware.checkAuthentication, unfollowUser_1.unfollowUser.follower);
        return this.router;
    }
}
exports.followerRoutes = new FollowerRoutes();
//# sourceMappingURL=followerRoutes.js.map