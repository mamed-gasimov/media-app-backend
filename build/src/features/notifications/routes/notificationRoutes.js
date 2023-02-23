"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
const updateNotification_1 = require("../controllers/updateNotification");
const deleteNotification_1 = require("../controllers/deleteNotification");
const getNotifications_1 = require("../controllers/getNotifications");
class NotificationRoutes {
    constructor() {
        this.router = express_1.default.Router();
    }
    routes() {
        this.router.get('/notifications', authMiddleware_1.authMiddleware.checkAuthentication, getNotifications_1.getNotifications.notifications);
        this.router.put('/notifications/:notificationId', authMiddleware_1.authMiddleware.checkAuthentication, updateNotification_1.updateNotification.notification);
        this.router.delete('/notifications/:notificationId', authMiddleware_1.authMiddleware.checkAuthentication, deleteNotification_1.deleteNotification.notification);
        return this.router;
    }
}
exports.notificationRoutes = new NotificationRoutes();
//# sourceMappingURL=notificationRoutes.js.map