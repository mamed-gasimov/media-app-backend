"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionQueue = void 0;
const base_queue_1 = require("../queues/base.queue");
const reaction_worker_1 = require("../../workers/reaction.worker");
class ReactionQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('reactions');
        this.processJob('addReactionDataToDb', 5, reaction_worker_1.reactionWorker.saveReactionToDb);
        this.processJob('removeReactionDataFromDb', 5, reaction_worker_1.reactionWorker.removeReactionFromDb);
    }
    addReactionJob(name, data) {
        this.addJob(name, data);
    }
}
exports.reactionQueue = new ReactionQueue();
//# sourceMappingURL=reaction.queue.js.map