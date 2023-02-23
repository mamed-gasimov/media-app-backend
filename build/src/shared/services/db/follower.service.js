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
exports.followerService = void 0;
const mongoose_1 = require("mongoose");
const follower_model_1 = require("../../../features/followers/models/follower.model");
const user_model_1 = require("../../../features/user/models/user.model");
const user_cache_1 = require("../redis/user.cache");
const email_queue_1 = require("../queues/email.queue");
const notificationTemplate_1 = require("../emails/templates/notifications/notificationTemplate");
const notification_sockets_1 = require("../../sockets/notification.sockets");
const notification_model_1 = require("../../../features/notifications/models/notification.model");
const userCache = new user_cache_1.UserCache();
class FollowerService {
    addFollowerToDb(userId, followeeId, username, followerDocumentId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const followeeObjectId = new mongoose_1.Types.ObjectId(followeeId);
            const followerObjectId = new mongoose_1.Types.ObjectId(userId);
            const following = yield follower_model_1.FollowerModel.create({
                _id: followerDocumentId,
                followeeId: followeeObjectId,
                followerId: followerObjectId,
            });
            const users = user_model_1.UserModel.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: userId },
                        update: { $inc: { followingCount: 1 } },
                    },
                },
                {
                    updateOne: {
                        filter: { _id: followeeId },
                        update: { $inc: { followersCount: 1 } },
                    },
                },
            ]);
            const response = yield Promise.all([users, userCache.getUserFromCache(followeeId)]);
            if (((_a = response[1]) === null || _a === void 0 ? void 0 : _a.notifications.follows) && userId !== followeeId) {
                const notificationModel = new notification_model_1.NotificationModel();
                const notifications = yield notificationModel.insertNotification({
                    userFrom: userId,
                    userTo: followeeId,
                    message: `${username} is now following you.`,
                    notificationType: 'follows',
                    entityId: new mongoose_1.Types.ObjectId(userId),
                    createdItemId: new mongoose_1.Types.ObjectId(following._id),
                    createdAt: new Date(),
                    comment: '',
                    post: '',
                    imgId: '',
                    imgVersion: '',
                    gifUrl: '',
                    reaction: '',
                });
                notification_sockets_1.socketIONotificationObject.emit('insert notification', notifications, { userTo: followeeId });
                const templateParams = {
                    username: response[1].username,
                    message: `${username} is now following you.`,
                    header: 'Follower Notification',
                };
                const template = notificationTemplate_1.notificationTemplate.notificationMessageTemplate(templateParams);
                email_queue_1.emailQueue.addEmailJob('followersEmail', {
                    receiverEmail: response[1].email,
                    template,
                    subject: `${username} is now following you.`,
                });
            }
        });
    }
    removeFollowerFromDb(followeeId, followerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const followeeObjectId = new mongoose_1.Types.ObjectId(followeeId);
            const followerObjectId = new mongoose_1.Types.ObjectId(followerId);
            const unfollow = follower_model_1.FollowerModel.deleteOne({
                followeeId: followeeObjectId,
                followerId: followerObjectId,
            });
            const users = user_model_1.UserModel.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: followerId },
                        update: { $inc: { followingCount: -1, $min: 0 } },
                    },
                },
                {
                    updateOne: {
                        filter: { _id: followeeId },
                        update: { $inc: { followersCount: -1, $min: 0 } },
                    },
                },
            ]);
            yield Promise.all([unfollow, users]);
        });
    }
    getFollowingsData(userObjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getFollowUserData(userObjectId, 'followeeId');
        });
    }
    getFollowersData(userObjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getFollowUserData(userObjectId, 'followerId');
        });
    }
    getFollowUserData(userObjectId, followTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            let key = 'followerId';
            if (followTypeId === 'followerId') {
                key = 'followeeId';
            }
            else if (followTypeId === 'followeeId') {
                key = 'followerId';
            }
            const followee = yield follower_model_1.FollowerModel.aggregate([
                { $match: { [key]: userObjectId } },
                { $lookup: { from: 'User', localField: followTypeId, foreignField: '_id', as: followTypeId } },
                { $unwind: `$${followTypeId}` },
                { $lookup: { from: 'Auth', localField: `${followTypeId}.authId`, foreignField: '_id', as: 'authId' } },
                { $unwind: '$authId' },
                {
                    $addFields: {
                        _id: `$${followTypeId}._id`,
                        username: '$authId.username',
                        avatarColor: '$authId.avatarColor',
                        uId: '$authId.uId',
                        postCount: `$${followTypeId}.postsCount`,
                        followersCount: `$${followTypeId}.followersCount`,
                        followingCount: `$${followTypeId}.followingCount`,
                        profilePicture: `$${followTypeId}.profilePicture`,
                        userProfile: `$${followTypeId}`,
                    },
                },
                {
                    $project: {
                        authId: 0,
                        followerId: 0,
                        followeeId: 0,
                        createdAt: 0,
                        __v: 0,
                    },
                },
            ]);
            return followee;
        });
    }
    getFolloweesIds(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const followee = yield follower_model_1.FollowerModel.aggregate([
                { $match: { followerId: new mongoose_1.Types.ObjectId(userId) } },
                {
                    $project: {
                        followeeId: 1,
                        _id: 0,
                    },
                },
            ]);
            return followee.map((result) => result.followeeId.toString());
        });
    }
    alreadyFollows(userId, followeeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield follower_model_1.FollowerModel.findOne({
                followerId: new mongoose_1.Types.ObjectId(userId),
                followeeId: new mongoose_1.Types.ObjectId(followeeId),
            }));
            return data;
        });
    }
}
exports.followerService = new FollowerService();
//# sourceMappingURL=follower.service.js.map