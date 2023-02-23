"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followerQueue = void 0;
const base_queue_1 = require("../queues/base.queue");
const follower_worker_1 = require("../../workers/follower.worker");
class FollowerQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('followers');
        this.processJob('addFollowerToDb', 5, follower_worker_1.followerWorker.addFollowerToDb);
        this.processJob('removeFollowerFromDb', 5, follower_worker_1.followerWorker.removeFollowerFromDb);
    }
    addFollowerJob(name, data) {
        this.addJob(name, data);
    }
}
exports.followerQueue = new FollowerQueue();
//# sourceMappingURL=follower.queue.js.map