"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModel = void 0;
const mongoose_1 = require("mongoose");
const conversationSchema = new mongoose_1.Schema({
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
});
const ConversationModel = (0, mongoose_1.model)('Conversation', conversationSchema, 'Conversation');
exports.ConversationModel = ConversationModel;
//# sourceMappingURL=conversation.model.js.map