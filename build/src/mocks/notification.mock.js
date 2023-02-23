"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationData = exports.notificationMockResponse = exports.notificationMockRequest = void 0;
const notificationMockRequest = (sessionData, currentUser, params) => ({
    session: sessionData,
    params,
    currentUser,
});
exports.notificationMockRequest = notificationMockRequest;
const notificationMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
exports.notificationMockResponse = notificationMockResponse;
exports.notificationData = {
    _id: '60263f14648fed5446e322d9',
    userTo: '60263f14648fed5246e322d9',
    userFrom: '60263f14648fed5246e322d8',
    message: 'Testing the microphone',
    notificationType: 'comments',
    entityId: '60263f14638fed5246e322d9',
    createdItemId: '60263f14748fed5246e322d9',
    comment: '',
    reaction: '',
    post: '',
    imgId: '',
    imgVersion: '',
    gifUrl: '',
    read: false,
    createdAt: new Date(),
};
//# sourceMappingURL=notification.mock.js.map