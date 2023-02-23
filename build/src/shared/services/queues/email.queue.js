"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const email_worker_1 = require("../../workers/email.worker");
const base_queue_1 = require("../queues/base.queue");
class EmailQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('emails');
        this.processJob('forgotPasswordEmail', 5, email_worker_1.emailWorker.addNotificationEmail);
        this.processJob('commentsEmail', 5, email_worker_1.emailWorker.addNotificationEmail);
        this.processJob('followersEmail', 5, email_worker_1.emailWorker.addNotificationEmail);
        this.processJob('reactionsEmail', 5, email_worker_1.emailWorker.addNotificationEmail);
        this.processJob('directMessageEmail', 5, email_worker_1.emailWorker.addNotificationEmail);
        this.processJob('changePassword', 5, email_worker_1.emailWorker.addNotificationEmail);
    }
    addEmailJob(name, data) {
        this.addJob(name, data);
    }
}
exports.emailQueue = new EmailQueue();
//# sourceMappingURL=email.queue.js.map