"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageQueue = void 0;
const base_queue_1 = require("../queues/base.queue");
const image_worker_1 = require("../../workers/image.worker");
class ImageQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('images');
        this.processJob('addUserProfileImageToDb', 5, image_worker_1.imageWorker.addUserProfileImageToDb);
        this.processJob('addBGImageToDb', 5, image_worker_1.imageWorker.addBGImageToDb);
        this.processJob('addImageToDb', 5, image_worker_1.imageWorker.addImageToDb);
        this.processJob('removeImageFromDb', 5, image_worker_1.imageWorker.removeImageFromDb);
    }
    addImageJob(name, data) {
        this.addJob(name, data);
    }
}
exports.imageQueue = new ImageQueue();
//# sourceMappingURL=image.queue.js.map