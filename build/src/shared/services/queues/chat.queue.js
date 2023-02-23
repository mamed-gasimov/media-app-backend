"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatQueue = void 0;
const base_queue_1 = require("../queues/base.queue");
const chat_worker_1 = require("../../workers/chat.worker");
class ChatQueue extends base_queue_1.BaseQueue {
    constructor() {
        super('chats');
        this.processJob('addChatMessageToDb', 5, chat_worker_1.chatWorker.addChatMessageToDb);
        this.processJob('markMessageAsDeletedInDb', 5, chat_worker_1.chatWorker.markMessageAsDeleted);
        this.processJob('markMessagesAsReadInDb', 5, chat_worker_1.chatWorker.markMessagesAsReadInDb);
        this.processJob('updateMessageReaction', 5, chat_worker_1.chatWorker.updateMessageReaction);
    }
    addChatJob(name, data) {
        this.addJob(name, data);
    }
}
exports.chatQueue = new ChatQueue();
//# sourceMappingURL=chat.queue.js.map