"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMessageReactionSchema = exports.deleteChatMessageSchema = exports.chatUserSchema = exports.addChatSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const addChatSchema = joi_1.default.object().keys({
    conversationId: joi_1.default.string().optional().allow(null, ''),
    receiverId: joi_1.default.string().required(),
    body: joi_1.default.string().optional().allow(null, ''),
    gifUrl: joi_1.default.string().optional().allow(null, ''),
    selectedImage: joi_1.default.string().optional().allow(null, ''),
    isRead: joi_1.default.boolean().optional(),
});
exports.addChatSchema = addChatSchema;
const deleteChatMessageSchema = joi_1.default.object().keys({
    receiverId: joi_1.default.string().required(),
    messageId: joi_1.default.string().required(),
    type: joi_1.default.string().valid('deleteForMe', 'deleteForEveryone').required(),
});
exports.deleteChatMessageSchema = deleteChatMessageSchema;
const chatUserSchema = joi_1.default.object().keys({
    receiverId: joi_1.default.string().required(),
});
exports.chatUserSchema = chatUserSchema;
const addMessageReactionSchema = joi_1.default.object().keys({
    conversationId: joi_1.default.string().required(),
    messageId: joi_1.default.string().required(),
    reaction: joi_1.default.string().valid('like', 'love', 'happy', 'wow', 'sad', 'angry').required(),
    type: joi_1.default.string().valid('add', 'remove').required(),
});
exports.addMessageReactionSchema = addMessageReactionSchema;
//# sourceMappingURL=chat.js.map