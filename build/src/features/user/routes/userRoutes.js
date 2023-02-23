"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
const getUserProfiles_1 = require("../controllers/getUserProfiles");
const searchUser_1 = require("../controllers/searchUser");
const updateUserInfo_1 = require("../controllers/updateUserInfo");
class UserRoutes {
    constructor() {
        this.router = express_1.default.Router();
    }
    routes() {
        this.router.post('/users/all', authMiddleware_1.authMiddleware.checkAuthentication, getUserProfiles_1.getUserProfiles.all);
        this.router.get('/users/suggestions', authMiddleware_1.authMiddleware.checkAuthentication, getUserProfiles_1.getUserProfiles.randomUserSuggestions);
        this.router.get('/users/:userId', authMiddleware_1.authMiddleware.checkAuthentication, getUserProfiles_1.getUserProfiles.profileByUserId);
        this.router.get('/user/profile', authMiddleware_1.authMiddleware.checkAuthentication, getUserProfiles_1.getUserProfiles.currentUserProfile);
        this.router.get('/user/posts/:userId', authMiddleware_1.authMiddleware.checkAuthentication, getUserProfiles_1.getUserProfiles.profileAndPosts);
        this.router.get('/user/search/:query', authMiddleware_1.authMiddleware.checkAuthentication, searchUser_1.searchUser.user);
        this.router.put('/user/change-password', authMiddleware_1.authMiddleware.checkAuthentication, updateUserInfo_1.updateUserInfo.password);
        this.router.put('/user/profile', authMiddleware_1.authMiddleware.checkAuthentication, updateUserInfo_1.updateUserInfo.updateProfileInfo);
        return this.router;
    }
}
exports.userRoutes = new UserRoutes();
//# sourceMappingURL=userRoutes.js.map