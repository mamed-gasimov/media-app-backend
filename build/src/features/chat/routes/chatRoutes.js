"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
const addChatMessage_1 = require("../controllers/addChatMessage");
const getChatMessages_1 = require("../controllers/getChatMessages");
const deleteChatMessage_1 = require("../controllers/deleteChatMessage");
const updateChatMessage_1 = require("../controllers/updateChatMessage");
const addMessageReaction_1 = require("../controllers/addMessageReaction");
class ChatRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.get('/chat/conversation-list', authMiddleware_1.authMiddleware.checkAuthentication, getChatMessages_1.getChatMessages.conversationList);
        this.router.get('/chat/messages/:receiverId', authMiddleware_1.authMiddleware.checkAuthentication, getChatMessages_1.getChatMessages.messages);
        this.router.post('/chat/message', authMiddleware_1.authMiddleware.checkAuthentication, addChatMessage_1.addChatMessage.message);
        this.router.post('/chat/users', authMiddleware_1.authMiddleware.checkAuthentication, addChatMessage_1.addChatMessage.addChatUsers);
        this.router.put('/chat/message', authMiddleware_1.authMiddleware.checkAuthentication, updateChatMessage_1.updateChatMessage.markMessageAsRead);
        this.router.put('/chat/message/reaction', authMiddleware_1.authMiddleware.checkAuthentication, addMessageReaction_1.addMessageReaction.reaction);
        this.router.delete('/chat/users', authMiddleware_1.authMiddleware.checkAuthentication, addChatMessage_1.addChatMessage.removeChatUsers);
        this.router.delete('/chat/message', authMiddleware_1.authMiddleware.checkAuthentication, deleteChatMessage_1.deleteChatMessage.markMessageAsDeleted);
        return this.router;
    }
}
exports.chatRoutes = new ChatRoutes();
//# sourceMappingURL=chatRoutes.js.map