"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authQueue = void 0;
const auth_worker_1 = require("../../workers/auth.worker");
const base_queue_1 = require("../queues/base.queue");
class AuthQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('auth');
        this.processJob('addAuthUserToDb', 5, auth_worker_1.authWorker.addAuthUserToDb);
    }
    addAuthUserJob(name, data) {
        this.addJob(name, data);
    }
}
exports.authQueue = new AuthQueue();
//# sourceMappingURL=auth.queue.js.map