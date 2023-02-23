"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followerData = exports.mockFollowerData = exports.followersMockResponse = exports.followersMockRequest = void 0;
const mongoose_1 = require("mongoose");
const user_mock_1 = require("../mocks/user.mock");
const followersMockRequest = (sessionData, currentUser, params) => ({
    session: sessionData,
    params,
    currentUser,
});
exports.followersMockRequest = followersMockRequest;
const followersMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
exports.followersMockResponse = followersMockResponse;
exports.mockFollowerData = {
    avatarColor: `${user_mock_1.existingUserTwo.avatarColor}`,
    followersCount: user_mock_1.existingUserTwo.followersCount,
    followingCount: user_mock_1.existingUserTwo.followingCount,
    profilePicture: `${user_mock_1.existingUserTwo.profilePicture}`,
    postCount: user_mock_1.existingUserTwo.postsCount,
    username: `${user_mock_1.existingUserTwo.username}`,
    uId: `${user_mock_1.existingUserTwo.uId}`,
    _id: new mongoose_1.Types.ObjectId(user_mock_1.existingUserTwo._id),
};
exports.followerData = {
    _id: '605727cd646cb50e668a4e13',
    followerId: {
        username: 'Manny',
        postCount: 5,
        avatarColor: '#ff9800',
        followersCount: 3,
        followingCount: 5,
        profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13',
    },
    followeeId: {
        username: 'Danny',
        postCount: 10,
        avatarColor: '#ff9800',
        followersCount: 3,
        followingCount: 5,
        profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13',
    },
};
//# sourceMappingURL=followers.mock.js.map