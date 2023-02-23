"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentNames = exports.commentsData = exports.reactionData = exports.removeReactionMock = exports.reactionMock = exports.reactionMockResponse = exports.reactionMockRequest = void 0;
const reactionMockRequest = (sessionData, body, currentUser, params) => ({
    session: sessionData,
    body,
    params,
    currentUser,
});
exports.reactionMockRequest = reactionMockRequest;
const reactionMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
exports.reactionMockResponse = reactionMockResponse;
exports.reactionMock = {
    postId: '6027f77087c9d9ccb1555268',
    previousReaction: 'love',
    profilePicture: 'http://place-hold.it/500x500',
    type: 'like',
};
exports.removeReactionMock = {
    postId: '6027f77087c9d9ccb1555268',
    previousReaction: 'like',
};
exports.reactionData = {
    _id: '6064861bc25eaa5a5d2f9bf4',
    username: 'Danny',
    postId: '6027f77087c9d9ccb1555268',
    profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
    comment: 'This is a comment',
    createdAt: new Date(),
    userTo: '60263f14648fed5246e322d9',
    type: 'love',
};
exports.commentsData = {
    _id: '6064861bc25eaa5a5d2f9bf4',
    username: 'Danny',
    avatarColor: '#9c27b0',
    postId: '6027f77087c9d9ccb1555268',
    profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/6064793b091bf02b6a71067a',
    comment: 'This is a comment',
    createdAt: new Date(),
    userTo: '60263f14648fed5246e322d9',
};
exports.commentNames = {
    count: 1,
    names: ['Danny'],
};
//# sourceMappingURL=reactions.mock.js.map