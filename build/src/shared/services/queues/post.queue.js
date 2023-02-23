"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postQueue = void 0;
const post_worker_1 = require("../../workers/post.worker");
const base_queue_1 = require("../queues/base.queue");
class PostQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('post');
        this.processJob('addPostToDb', 5, post_worker_1.postWorker.savePostToDb);
        this.processJob('deletePostFromDb', 5, post_worker_1.postWorker.deletePostFromDb);
        this.processJob('updatePostInDb', 5, post_worker_1.postWorker.updatePostInDb);
    }
    addPostJob(name, data) {
        this.addJob(name, data);
    }
}
exports.postQueue = new PostQueue();
//# sourceMappingURL=post.queue.js.map