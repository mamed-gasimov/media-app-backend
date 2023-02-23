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
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const notification_service_1 = require("../../../shared/services/db/notification.service");
const notificationSchema = new mongoose_1.Schema({
    userTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    userFrom: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    message: { type: String, default: '' },
    notificationType: { type: String, default: '' },
    entityId: mongoose_1.Types.ObjectId,
    createdItemId: mongoose_1.Types.ObjectId,
    comment: { type: String, default: '' },
    reaction: { type: String, default: '' },
    post: { type: String, default: '' },
    imgId: { type: String, default: '' },
    imgVersion: { type: String, default: '' },
    gifUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now() },
});
notificationSchema.methods.insertNotification = function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userTo } = data;
        yield NotificationModel.create(Object.assign({}, data));
        try {
            const notifications = yield notification_service_1.notificationService.getNotifications(userTo);
            return notifications;
        }
        catch (error) {
            return error;
        }
    });
};
const NotificationModel = (0, mongoose_1.model)('Notification', notificationSchema, 'Notification');
exports.NotificationModel = NotificationModel;
//# sourceMappingURL=notification.model.js.map