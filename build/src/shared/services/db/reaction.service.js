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
exports.reactionService = void 0;
const lodash_1 = require("lodash");
const mongoose_1 = require("mongoose");
const reaction_model_1 = require("../../../features/reactions/models/reaction.model");
const user_cache_1 = require("../redis/user.cache");
const post_model_1 = require("../../../features/post/models/post.model");
const helpers_1 = require("../../globals/helpers/helpers");
const notification_model_1 = require("../../../features/notifications/models/notification.model");
const notification_sockets_1 = require("../../sockets/notification.sockets");
const notificationTemplate_1 = require("../emails/templates/notifications/notificationTemplate");
const email_queue_1 = require("../queues/email.queue");
const userCache = new user_cache_1.UserCache();
class ReactionService {
    addReactionDataToDb(reactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, previousReaction, username, reactionObject, type, userFrom, userTo } = reactionData;
            let updatedReactionObject = reactionObject;
            if (previousReaction) {
                updatedReactionObject = (0, lodash_1.omit)(reactionObject, ['_id']);
            }
            const updatedReaction = (yield Promise.all([
                userCache.getUserFromCache(`${userTo}`),
                reaction_model_1.ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, {
                    upsert: true,
                }),
                post_model_1.PostModel.findOneAndUpdate({ _id: postId }, {
                    $inc: {
                        [`reactions.${previousReaction}`]: -1,
                        [`reactions.${type}`]: 1,
                    },
                }, { new: true }),
            ]));
            if (updatedReaction[0].notifications.reactions && userTo !== userFrom) {
                const notificationModel = new notification_model_1.NotificationModel();
                const notifications = yield notificationModel.insertNotification({
                    userFrom: userFrom,
                    userTo: userTo,
                    message: `${username} reacted to your post.`,
                    notificationType: 'reactions',
                    entityId: new mongoose_1.Types.ObjectId(postId),
                    createdItemId: new mongoose_1.Types.ObjectId(updatedReaction[1]._id),
                    createdAt: new Date(),
                    comment: '',
                    post: updatedReaction[2].post,
                    imgId: updatedReaction[2].imgId,
                    imgVersion: updatedReaction[2].imgVersion,
                    gifUrl: updatedReaction[2].gifUrl,
                    reaction: type,
                });
                notification_sockets_1.socketIONotificationObject.emit('insert notification', notifications, { userTo });
                const templateParams = {
                    username: updatedReaction[0].username,
                    message: `${username} reacted to your post.`,
                    header: 'Post Reaction Notification',
                };
                const template = notificationTemplate_1.notificationTemplate.notificationMessageTemplate(templateParams);
                email_queue_1.emailQueue.addEmailJob('reactionsEmail', {
                    receiverEmail: updatedReaction[0].email,
                    template,
                    subject: 'Post reaction notification',
                });
            }
        });
    }
    removeReactionDataFromDB(reactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, previousReaction, username } = reactionData;
            yield Promise.all([
                reaction_model_1.ReactionModel.deleteOne({ postId, type: previousReaction, username }),
                post_model_1.PostModel.updateOne({ _id: postId }, {
                    $inc: {
                        [`reactions.${previousReaction}`]: -1,
                    },
                }, { new: true }),
            ]);
        });
    }
    getPostReactions(query, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            const reactions = yield reaction_model_1.ReactionModel.aggregate([
                { $match: query },
                { $sort: sort },
            ]);
            return reactions;
        });
    }
    getSinglePostReactionByUsername(postId, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const reactions = yield reaction_model_1.ReactionModel.aggregate([
                { $match: { postId: new mongoose_1.Types.ObjectId(postId), username: helpers_1.Helpers.firstLetterUpperCase(username) } },
            ]);
            return reactions === null || reactions === void 0 ? void 0 : reactions[0];
        });
    }
    getReactionsByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const reactions = yield reaction_model_1.ReactionModel.aggregate([
                { $match: { username: helpers_1.Helpers.firstLetterUpperCase(username) } },
            ]);
            return reactions;
        });
    }
}
exports.reactionService = new ReactionService();
//# sourceMappingURL=reaction.service.js.map