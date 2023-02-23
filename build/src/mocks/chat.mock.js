"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatList = exports.messageDataMock = exports.chatMessageBody = exports.chatMessage = exports.mockMessageId = exports.chatMockResponse = exports.chatMockRequest = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = require("mongoose");
const user_mock_1 = require("../mocks/user.mock");
const chatMockRequest = (sessionData, body, currentUser, params) => ({
    session: sessionData,
    body,
    params,
    currentUser,
});
exports.chatMockRequest = chatMockRequest;
const chatMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
exports.chatMockResponse = chatMockResponse;
exports.mockMessageId = new mongodb_1.ObjectId();
exports.chatMessage = {
    body: 'how are you?',
    conversationId: '602854c81c9ca7939aaeba43',
    gifUrl: '',
    isRead: false,
    receiverId: '60263f14648fed5246e322d8',
    receiverUsername: 'Danny',
    receiverAvatarColor: '#9c27b0',
    receiverProfilePicture: 'http://place-hold.it/500x500',
    selectedImage: '',
};
exports.chatMessageBody = {
    body: 'how are you?',
    conversationId: '602854c81c9ca7939aaeba43',
    gifUrl: '',
    isRead: false,
    receiverId: '60263f14648fed5246e322d8',
    selectedImage: '',
};
exports.messageDataMock = {
    _id: `${exports.mockMessageId}`,
    conversationId: new mongoose_1.Types.ObjectId(exports.chatMessage.conversationId),
    receiverId: '60263f14648fed5246e322d8',
    receiverUsername: exports.chatMessage.receiverUsername,
    receiverAvatarColor: exports.chatMessage.receiverAvatarColor,
    receiverProfilePicture: exports.chatMessage.receiverProfilePicture,
    senderUsername: user_mock_1.existingUser.username,
    senderId: `${user_mock_1.existingUser._id}`,
    senderAvatarColor: user_mock_1.existingUser.avatarColor,
    senderProfilePicture: user_mock_1.existingUser.profilePicture,
    body: exports.chatMessage.body,
    isRead: exports.chatMessage.isRead,
    gifUrl: exports.chatMessage.gifUrl,
    selectedImage: exports.chatMessage.selectedImage,
    reaction: {
        receiver: {
            username: exports.chatMessage.receiverUsername,
        },
        sender: {
            username: user_mock_1.existingUser.username,
        },
    },
    createdAt: '2022-06-29T12:51:39.483Z',
    deleteForMe: false,
};
exports.chatList = [
    {
        receiverId: `${user_mock_1.existingUserTwo._id}`,
        conversationId: exports.chatMessage.conversationId,
    },
];
//# sourceMappingURL=chat.mock.js.map