"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChatMessage = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = require("mongoose");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_cache_1 = require("../../../shared/services/redis/user.cache");
const chat_1 = require("../schemas/chat");
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const cloudinaryUpload_1 = require("../../../shared/globals/helpers/cloudinaryUpload");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const config_1 = require("../../../config");
const chat_sockets_1 = require("../../../shared/sockets/chat.sockets");
const notificationTemplate_1 = require("../../../shared/services/emails/templates/notifications/notificationTemplate");
const email_queue_1 = require("../../../shared/services/queues/email.queue");
const chat_cache_1 = require("../../../shared/services/redis/chat.cache");
const user_service_1 = require("../../../shared/services/db/user.service");
const chat_queue_1 = require("../../../shared/services/queues/chat.queue");
const userCache = new user_cache_1.UserCache();
const chatCache = new chat_cache_1.ChatCache();
class AddChatMessage {
    message(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { conversationId, receiverId, body, gifUrl, isRead, selectedImage } = req.body;
            if (!helpers_1.Helpers.checkValidObjectId(receiverId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            if (receiverId === `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const receiverUser = yield user_service_1.userService.getUserById(receiverId);
            if (!receiverUser) {
                throw new errorHandler_1.BadRequestError('User was not found.');
            }
            let fileUrl = '';
            const messageObjectId = new mongodb_1.ObjectId();
            const conversationObjectId = !conversationId ? new mongodb_1.ObjectId() : new mongodb_1.ObjectId(conversationId);
            const sender = (yield userCache.getUserFromCache(`${req.currentUser.userId}`));
            if (selectedImage) {
                if (helpers_1.Helpers.isDataBase64(selectedImage)) {
                    const result = yield (0, cloudinaryUpload_1.uploads)(selectedImage, req.currentUser.userId, true, true);
                    if (!(result === null || result === void 0 ? void 0 : result.public_id)) {
                        throw new errorHandler_1.BadRequestError((result === null || result === void 0 ? void 0 : result.message) || 'File upload: Error occurred. Try again.');
                    }
                    fileUrl = `https://res.cloudinary.com/${config_1.config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
                }
                else {
                    throw new errorHandler_1.BadRequestError('Incorrect file format.');
                }
            }
            const messageData = {
                _id: `${messageObjectId}`,
                conversationId: new mongoose_1.Types.ObjectId(conversationObjectId),
                receiverId,
                receiverAvatarColor: receiverUser.avatarColor || '',
                receiverProfilePicture: receiverUser.profilePicture || '',
                receiverUsername: receiverUser.username || '',
                senderUsername: `${req.currentUser.username}`,
                senderId: `${req.currentUser.userId}`,
                senderAvatarColor: `${req.currentUser.avatarColor}`,
                senderProfilePicture: `${sender.profilePicture}`,
                body,
                isRead,
                gifUrl,
                selectedImage: fileUrl,
                reaction: {
                    sender: { username: `${req.currentUser.username}`, reactionType: undefined },
                    receiver: { username: receiverUser.username, reactionType: undefined },
                },
                createdAt: new Date(),
                deleteForMe: false,
            };
            AddChatMessage.prototype.emitSocketIOEvent(messageData);
            if (!isRead) {
                AddChatMessage.prototype.messageNotification({
                    currentUser: req.currentUser,
                    message: body,
                    receiverName: receiverUser.username,
                    receiverId,
                });
            }
            yield chatCache.addChatListToCache(`${req.currentUser.userId}`, `${receiverId}`, `${conversationObjectId}`);
            yield chatCache.addChatListToCache(`${receiverId}`, `${req.currentUser.userId}`, `${conversationObjectId}`);
            yield chatCache.addChatMessageToCache(`${conversationObjectId}`, messageData);
            chat_queue_1.chatQueue.addChatJob('addChatMessageToDb', messageData);
            res.status(http_status_codes_1.default.OK).json({ message: 'Message added', conversationId: conversationObjectId });
        });
    }
    addChatUsers(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { receiverId } = req.body;
            if (!helpers_1.Helpers.checkValidObjectId(receiverId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            if (receiverId === `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const chatUsers = yield chatCache.addChatUsersToCache({
                userOne: `${req.currentUser.userId}`,
                userTwo: receiverId,
            });
            chat_sockets_1.socketIOChatObject.emit('add chat users', chatUsers);
            res.status(http_status_codes_1.default.OK).json({ message: 'Users added' });
        });
    }
    removeChatUsers(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { receiverId } = req.body;
            if (!helpers_1.Helpers.checkValidObjectId(receiverId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            if (receiverId === `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const chatUsers = yield chatCache.removeChatUsersFromCache({
                userOne: `${req.currentUser.userId}`,
                userTwo: receiverId,
            });
            chat_sockets_1.socketIOChatObject.emit('add chat users', chatUsers);
            res.status(http_status_codes_1.default.OK).json({ message: 'Users removed' });
        });
    }
    emitSocketIOEvent(data) {
        chat_sockets_1.socketIOChatObject.emit('message received', data);
        chat_sockets_1.socketIOChatObject.emit('chat list', data);
    }
    messageNotification({ currentUser, message, receiverName, receiverId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedUser = (yield userCache.getUserFromCache(`${receiverId}`));
            if (cachedUser.notifications.messages) {
                const templateParams = {
                    username: receiverName,
                    message,
                    header: `Message notification from ${currentUser.username}`,
                };
                const template = notificationTemplate_1.notificationTemplate.notificationMessageTemplate(templateParams);
                email_queue_1.emailQueue.addEmailJob('directMessageEmail', {
                    receiverEmail: cachedUser.email,
                    template,
                    subject: `You've received messages from ${currentUser.username}`,
                });
            }
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(chat_1.addChatSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AddChatMessage.prototype, "message", null);
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(chat_1.chatUserSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AddChatMessage.prototype, "addChatUsers", null);
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(chat_1.chatUserSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AddChatMessage.prototype, "removeChatUsers", null);
exports.addChatMessage = new AddChatMessage();
//# sourceMappingURL=addChatMessage.js.map