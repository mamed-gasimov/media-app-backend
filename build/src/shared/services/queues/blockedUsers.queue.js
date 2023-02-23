"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockedUsersQueue = void 0;
const base_queue_1 = require("../queues/base.queue");
const blockedUsers_worker_1 = require("../../workers/blockedUsers.worker");
class BlockedUsersQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('blockedUsers');
        this.processJob('addBlockedUserToDb', 5, blockedUsers_worker_1.blockedUsersWorker.updateBlockUserInDb);
        this.processJob('removeBlockedUserFromDb', 5, blockedUsers_worker_1.blockedUsersWorker.updateBlockUserInDb);
    }
    addBlockedUsersJob(name, data) {
        this.addJob(name, data);
    }
}
exports.blockedUsersQueue = new BlockedUsersQueue();
//# sourceMappingURL=blockedUsers.queue.js.map