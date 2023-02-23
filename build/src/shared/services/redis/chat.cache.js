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
exports.ChatCache = void 0;
const errorHandler_1 = require("../../globals/helpers/errorHandler");
const helpers_1 = require("../../globals/helpers/helpers");
const config_1 = require("../../../config");
const base_cache_1 = require("../redis/base.cache");
const log = config_1.config.createLogger('chatCache');
class ChatCache extends base_cache_1.BaseCache {
    constructor() {
        super('chatCache');
    }
    addChatListToCache(senderId, receiverId, conversationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const userChatList = yield this.client.LRANGE(`chatList:${senderId}`, 0, -1);
                if (userChatList.length === 0) {
                    yield this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
                }
                else {
                    const receiverIndex = userChatList.findIndex((listItem) => listItem.includes(receiverId));
                    if (receiverIndex === -1) {
                        yield this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
                    }
                }
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    addChatMessageToCache(conversationId, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                yield this.client.LPUSH(`messages:${conversationId}`, JSON.stringify(value));
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    addChatUsersToCache(value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const users = yield this.getChatUsersList();
                const usersIndex = users.findIndex((listItem) => JSON.stringify(listItem) === JSON.stringify(value));
                let chatUsers = [];
                if (usersIndex === -1) {
                    yield this.client.RPUSH('chatUsers', JSON.stringify(value));
                    chatUsers = yield this.getChatUsersList();
                }
                else {
                    chatUsers = users;
                }
                return chatUsers;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    removeChatUsersFromCache(value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const users = yield this.getChatUsersList();
                const usersIndex = users.findIndex((listItem) => JSON.stringify(listItem) === JSON.stringify(value));
                let chatUsers = [];
                if (usersIndex > -1) {
                    yield this.client.LREM('chatUsers', usersIndex, JSON.stringify(value));
                    chatUsers = yield this.getChatUsersList();
                }
                else {
                    chatUsers = users;
                }
                return chatUsers;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getUserConversationList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const userChatList = yield this.client.LRANGE(`chatList:${userId}`, 0, -1);
                const conversationChatList = [];
                for (const item of userChatList) {
                    const chatItem = helpers_1.Helpers.parseJson(item);
                    const lastMessage = (yield this.client.LINDEX(`messages:${chatItem.conversationId}`, -1));
                    conversationChatList.push(helpers_1.Helpers.parseJson(lastMessage));
                }
                return conversationChatList;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getChatMessagesFromCache(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const userChatList = yield this.client.LRANGE(`chatList:${senderId}`, 0, -1);
                const receiver = userChatList.find((listItem) => listItem.includes(receiverId));
                const parsedReceiver = helpers_1.Helpers.parseJson(receiver);
                if (parsedReceiver) {
                    const userMessages = yield this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
                    const chatMessages = [];
                    for (const item of userMessages) {
                        const chatItem = helpers_1.Helpers.parseJson(item);
                        chatMessages.push(chatItem);
                    }
                    return chatMessages;
                }
                return [];
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    markMessageAsDeleted(senderId, receiverId, messageId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const foundMessage = yield this.getMessage(senderId, receiverId, messageId);
                if (!foundMessage || !(foundMessage === null || foundMessage === void 0 ? void 0 : foundMessage.message) || (foundMessage === null || foundMessage === void 0 ? void 0 : foundMessage.index) === -1) {
                    return null;
                }
                const { index, message, receiver } = foundMessage;
                const chatItem = helpers_1.Helpers.parseJson(message);
                if (type === 'deleteForMe') {
                    chatItem.deleteForMe = true;
                    yield this.client.LSET(`messages:${receiver.conversationId}`, index, JSON.stringify(chatItem));
                    const lastMessage = (yield this.client.LINDEX(`messages:${receiver.conversationId}`, index));
                    return helpers_1.Helpers.parseJson(lastMessage);
                }
                else if (type === 'deleteForEveryone') {
                    yield this.client.LREM(`messages:${receiver.conversationId}`, index, JSON.stringify(chatItem));
                }
                return null;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    updateChatMessages(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const userChatList = yield this.client.LRANGE(`chatList:${senderId}`, 0, -1);
                const receiver = userChatList.find((listItem) => listItem.includes(receiverId));
                const parsedReceiver = helpers_1.Helpers.parseJson(receiver);
                const messages = yield this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
                const unreadMessages = messages.filter((listItem) => !helpers_1.Helpers.parseJson(listItem).isRead);
                for (const item of unreadMessages) {
                    const chatItem = helpers_1.Helpers.parseJson(item);
                    const index = messages.findIndex((listItem) => listItem.includes(`${chatItem._id}`));
                    chatItem.isRead = true;
                    yield this.client.LSET(`messages:${chatItem.conversationId}`, index, JSON.stringify(chatItem));
                }
                const lastMessage = (yield this.client.LINDEX(`messages:${parsedReceiver.conversationId}`, -1));
                return helpers_1.Helpers.parseJson(lastMessage);
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    updateMessageReaction(conversationId, messageId, reaction, type, userType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                if (!userType) {
                    return null;
                }
                const messages = yield this.client.LRANGE(`messages:${conversationId}`, 0, -1);
                const messageIndex = messages.findIndex((listItem) => listItem.includes(messageId));
                const message = (yield this.client.LINDEX(`messages:${conversationId}`, messageIndex));
                if (!message) {
                    return null;
                }
                const parsedMessage = helpers_1.Helpers.parseJson(message);
                const copyMessage = parsedMessage;
                if (parsedMessage) {
                    if (type === 'add') {
                        copyMessage.reaction[userType].reactionType = reaction;
                    }
                    else if (type === 'remove') {
                        copyMessage.reaction[userType].reactionType = undefined;
                    }
                    yield this.client.LSET(`messages:${conversationId}`, messageIndex, JSON.stringify(copyMessage));
                }
                const updatedMessage = (yield this.client.LINDEX(`messages:${conversationId}`, messageIndex));
                return helpers_1.Helpers.parseJson(updatedMessage);
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getChatUsersList() {
        return __awaiter(this, void 0, void 0, function* () {
            const chatUsersList = [];
            const chatUsers = yield this.client.LRANGE('chatUsers', 0, -1);
            for (const item of chatUsers) {
                const chatUser = helpers_1.Helpers.parseJson(item);
                chatUsersList.push(chatUser);
            }
            return chatUsersList;
        });
    }
    getMessage(senderId, receiverId, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userChatList = yield this.client.LRANGE(`chatList:${senderId}`, 0, -1);
            const receiver = userChatList.find((listItem) => listItem.includes(receiverId));
            const parsedReceiver = helpers_1.Helpers.parseJson(receiver);
            const messages = yield this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
            const message = messages.find((listItem) => listItem.includes(messageId));
            const index = messages.findIndex((listItem) => listItem.includes(messageId));
            return { index, message, receiver: parsedReceiver };
        });
    }
}
exports.ChatCache = ChatCache;
//# sourceMappingURL=chat.cache.js.map