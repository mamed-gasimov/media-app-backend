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
exports.updateNotification = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const notification_queue_1 = require("../../../shared/services/queues/notification.queue");
const notification_sockets_1 = require("../../../shared/sockets/notification.sockets");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
class UpdateNotification {
    notification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { notificationId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(notificationId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            notification_sockets_1.socketIONotificationObject.emit('update notification', notificationId);
            notification_queue_1.notificationQueue.addNotificationJob('updateNotification', { key: notificationId });
            res.status(http_status_codes_1.default.OK).json({ message: 'Notification marked as read' });
        });
    }
}
exports.updateNotification = new UpdateNotification();
//# sourceMappingURL=updateNotification.js.map