"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userQueue = void 0;
const user_worker_1 = require("../../workers/user.worker");
const base_queue_1 = require("../queues/base.queue");
class UserQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('user');
        this.processJob('addUserToDb', 5, user_worker_1.userWorker.addUserToDb);
        this.processJob('updateSocialLinksInDb', 5, user_worker_1.userWorker.updateSocialLinks);
        this.processJob('updateBasicInfoInDb', 5, user_worker_1.userWorker.updateUserInfo);
        this.processJob('updateNotificationSettings', 5, user_worker_1.userWorker.updateNotificationSettings);
    }
    addUserJob(name, data) {
        this.addJob(name, data);
    }
}
exports.userQueue = new UserQueue();
//# sourceMappingURL=user.queue.js.map