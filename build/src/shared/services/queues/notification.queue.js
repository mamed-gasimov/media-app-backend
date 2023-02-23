"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationQueue = void 0;
const base_queue_1 = require("../queues/base.queue");
const notification_worker_1 = require("../../workers/notification.worker");
class NotificationQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('notifications');
        this.processJob('updateNotification', 5, notification_worker_1.notificationWorker.updateNotification);
        this.processJob('deleteNotification', 5, notification_worker_1.notificationWorker.deleteNotification);
    }
    addNotificationJob(name, data) {
        this.addJob(name, data);
    }
}
exports.notificationQueue = new NotificationQueue();
//# sourceMappingURL=notification.queue.js.map