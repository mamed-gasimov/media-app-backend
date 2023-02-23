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
exports.commentService = void 0;
const mongoose_1 = require("mongoose");
const comments_model_1 = require("../../../features/comments/models/comments.model");
const notification_model_1 = require("../../../features/notifications/models/notification.model");
const post_model_1 = require("../../../features/post/models/post.model");
const user_cache_1 = require("../redis/user.cache");
const notification_sockets_1 = require("../../sockets/notification.sockets");
const notificationTemplate_1 = require("../emails/templates/notifications/notificationTemplate");
const email_queue_1 = require("../queues/email.queue");
const userCache = new user_cache_1.UserCache();
class CommentService {
    addPostCommentToDb(commentData) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, comment, userTo, userFrom, username } = commentData;
            const createComment = comments_model_1.CommentsModel.create(comment);
            const updatePost = post_model_1.PostModel.findOneAndUpdate({ _id: postId }, { $inc: { commentsCount: 1 } }, { new: true });
            const user = userCache.getUserFromCache(userTo);
            const response = yield Promise.all([createComment, updatePost, user]);
            if (((_b = (_a = response[2]) === null || _a === void 0 ? void 0 : _a.notifications) === null || _b === void 0 ? void 0 : _b.comments) && userFrom !== userTo) {
                const notificationModel = new notification_model_1.NotificationModel();
                const notifications = yield notificationModel.insertNotification({
                    userFrom,
                    userTo,
                    message: `${username} commented on your post.`,
                    notificationType: 'comment',
                    entityId: new mongoose_1.Types.ObjectId(postId),
                    createdItemId: new mongoose_1.Types.ObjectId(response[0]._id),
                    createdAt: new Date(),
                    comment: comment.comment,
                    post: ((_c = response[1]) === null || _c === void 0 ? void 0 : _c.post) || '',
                    imgId: ((_d = response[1]) === null || _d === void 0 ? void 0 : _d.imgId) || '',
                    imgVersion: ((_e = response[1]) === null || _e === void 0 ? void 0 : _e.imgVersion) || '',
                    gifUrl: ((_f = response[1]) === null || _f === void 0 ? void 0 : _f.gifUrl) || '',
                    reaction: '',
                });
                notification_sockets_1.socketIONotificationObject.emit('insert notification', notifications, { userTo });
                const templateParams = {
                    username: response[2].username,
                    message: `${username} commented on your post.`,
                    header: 'Comment Notification',
                };
                const template = notificationTemplate_1.notificationTemplate.notificationMessageTemplate(templateParams);
                email_queue_1.emailQueue.addEmailJob('commentsEmail', {
                    receiverEmail: response[2].email,
                    template,
                    subject: 'Post notification',
                });
            }
        });
    }
    getPostCommentsFromDb(query, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield comments_model_1.CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
            return comments;
        });
    }
    getPostCommentNamesFromDb(query, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            const commentsNamesList = yield comments_model_1.CommentsModel.aggregate([
                { $match: query },
                { $sort: sort },
                { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
                { $project: { _id: 0 } },
            ]);
            return commentsNamesList;
        });
    }
}
exports.commentService = new CommentService();
//# sourceMappingURL=comment.service.js.map