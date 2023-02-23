"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileDocumentMock = exports.imagesMockResponse = exports.imagesMockRequest = void 0;
const mongoose_1 = require("mongoose");
const imagesMockRequest = (sessionData, body, currentUser, params) => ({
    session: sessionData,
    body,
    params,
    currentUser,
});
exports.imagesMockRequest = imagesMockRequest;
const imagesMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
exports.imagesMockResponse = imagesMockResponse;
exports.fileDocumentMock = {
    userId: new mongoose_1.Types.ObjectId('60263f14648fed5246e322d9'),
    bgImageVersion: '2468',
    bgImageId: '60263f',
    imgVersion: '',
    imgId: '',
    createdAt: new Date(),
    _id: '60263f14648fed5246e322d9',
};
//# sourceMappingURL=image.mock.js.map