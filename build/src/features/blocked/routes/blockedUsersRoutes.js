"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockedUsersRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
const blockedUsers_1 = require("../controllers/blockedUsers");
class BlockedUsersRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.put('/user/block/:userId', authMiddleware_1.authMiddleware.checkAuthentication, blockedUsers_1.blockedUsers.block);
        this.router.put('/user/unblock/:userId', authMiddleware_1.authMiddleware.checkAuthentication, blockedUsers_1.blockedUsers.unblock);
        return this.router;
    }
}
exports.blockedUsersRoutes = new BlockedUsersRoutes();
//# sourceMappingURL=blockedUsersRoutes.js.map