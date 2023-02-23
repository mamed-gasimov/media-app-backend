"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentQueue = void 0;
const base_queue_1 = require("../queues/base.queue");
const comment_worker_1 = require("../../workers/comment.worker");
class CommentQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('comments');
        this.processJob('addPostCommentToDb', 5, comment_worker_1.commentWorker.savePostCommentToDb);
    }
    addPostCommentJob(name, data) {
        this.addJob(name, data);
    }
}
exports.commentQueue = new CommentQueue();
//# sourceMappingURL=comment.queue.js.map