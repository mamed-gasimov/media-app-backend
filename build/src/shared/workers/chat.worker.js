"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWorker = void 0;
const config_1 = require("../../config");
const chat_service_1 = require("../services/db/chat.service");
const log = config_1.config.createLogger('chatWorker');
class ChatWorker {
    addChatMessageToDb(jobQueue, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield chat_service_1.chatService.addMessageToDb(jobQueue.data);
                jobQueue.progress(100);
                done(null, jobQueue.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    markMessageAsDeleted(jobQueue, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId, type } = jobQueue.data;
                yield chat_service_1.chatService.markMessageAsDeleted(messageId, type);
                jobQueue.progress(100);
                done(null, jobQueue.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    markMessagesAsReadInDb(jobQueue, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { senderId, receiverId } = jobQueue.data;
                yield chat_service_1.chatService.markMessagesAsRead(senderId, receiverId);
                jobQueue.progress(100);
                done(null, jobQueue.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    updateMessageReaction(jobQueue, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId, reaction, type, userType } = jobQueue.data;
                yield chat_service_1.chatService.updateMessageReaction(messageId, reaction, type, userType);
                jobQueue.progress(100);
                done(null, jobQueue.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
}
exports.chatWorker = new ChatWorker();
//# sourceMappingURL=chat.worker.js.map