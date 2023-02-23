"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    conversationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Conversation' },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    senderUsername: { type: String, default: '' },
    senderAvatarColor: { type: String, default: '' },
    senderProfilePicture: { type: String, default: '' },
    receiverUsername: { type: String, default: '' },
    receiverAvatarColor: { type: String, default: '' },
    receiverProfilePicture: { type: String, default: '' },
    body: { type: String, default: '' },
    gifUrl: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    deleteForMe: { type: Boolean, default: false },
    selectedImage: { type: String, default: '' },
    reaction: {
        sender: {
            username: { type: String, default: '' },
            reactionType: { type: String, default: '' },
        },
        receiver: {
            username: { type: String, default: '' },
            reactionType: { type: String, default: '' },
        },
    },
    createdAt: { type: Date, default: Date.now },
});
const MessageModel = (0, mongoose_1.model)('Message', messageSchema, 'Message');
exports.MessageModel = MessageModel;
//# sourceMappingURL=chat.model.js.map