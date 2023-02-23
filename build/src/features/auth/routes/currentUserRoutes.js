"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUserRoutes = void 0;
const express_1 = require("express");
const currentUser_1 = require("../controllers/currentUser");
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
class CurrentUserRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.get('/currentuser', authMiddleware_1.authMiddleware.checkAuthentication, currentUser_1.currentUser.read);
        return this.router;
    }
}
exports.currentUserRoutes = new CurrentUserRoutes();
//# sourceMappingURL=currentUserRoutes.js.map