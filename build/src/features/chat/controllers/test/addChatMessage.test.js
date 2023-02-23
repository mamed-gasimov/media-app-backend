"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const socket_io_1 = require("socket.io");
const chatServer = __importStar(require("../../../../shared/sockets/chat.sockets"));
const chat_mock_1 = require("../../../../mocks/chat.mock");
const addChatMessage_1 = require("../../controllers/addChatMessage");
const chat_queue_1 = require("../../../../shared/services/queues/chat.queue");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const chat_cache_1 = require("../../../../shared/services/redis/chat.cache");
const email_queue_1 = require("../../../../shared/services/queues/email.queue");
const user_mock_1 = require("../../../../mocks/user.mock");
const notificationTemplate_1 = require("../../../../shared/services/emails/templates/notifications/notificationTemplate");
const user_cache_1 = require("../../../../shared/services/redis/user.cache");
const user_service_1 = require("../../../../shared/services/db/user.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@socket/user.sockets');
jest.mock('@service/redis/user.cache');
jest.mock('@service/redis/chat.cache');
jest.mock('@service/queues/email.queue');
Object.defineProperties(chatServer, {
    socketIOChatObject: {
        value: new socket_io_1.Server(),
        writable: true,
    },
});
describe('Add Chat Message', () => {
    beforeEach(() => {
        jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(user_mock_1.existingUser);
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if receiverId is empty', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, chat_mock_1.chatMockRequest)({}, Object.assign(Object.assign({}, chat_mock_1.chatMessageBody), { receiverId: '' }), auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        addChatMessage_1.addChatMessage.message(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"receiverId" is not allowed to be empty');
        });
    }));
    it('should throw an error if receiverId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, chat_mock_1.chatMockRequest)({}, Object.assign(Object.assign({}, chat_mock_1.chatMessageBody), { receiverId: '12345' }), auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        addChatMessage_1.addChatMessage.message(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if receiverId is equal to current user id', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, chat_mock_1.chatMockRequest)({}, Object.assign(Object.assign({}, chat_mock_1.chatMessageBody), { receiverId: auth_mock_1.authUserPayload.userId }), auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        addChatMessage_1.addChatMessage.message(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if user with receiverId was not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessageBody, auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(undefined);
        addChatMessage_1.addChatMessage.message(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('User was not found.');
        });
    }));
    it('should call socket.io emit twice', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(chatServer.socketIOChatObject, 'emit');
        const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessageBody, auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(user_mock_1.mergedAuthAndUserData);
        yield addChatMessage_1.addChatMessage.message(req, res);
        expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
    }));
    it('should call addEmailJob method', () => __awaiter(void 0, void 0, void 0, function* () {
        user_mock_1.existingUserTwo.notifications.messages = true;
        const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessageBody, auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        const userData = Object.assign(Object.assign({}, user_mock_1.mergedAuthAndUserData), { username: 'Danny' });
        jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(userData);
        jest.spyOn(user_cache_1.UserCache.prototype, 'getUserFromCache').mockResolvedValue(user_mock_1.existingUserTwo);
        jest.spyOn(email_queue_1.emailQueue, 'addEmailJob');
        const templateParams = {
            username: user_mock_1.existingUserTwo.username,
            message: chat_mock_1.chatMessage.body,
            header: `Message notification from ${req.currentUser.username}`,
        };
        const template = notificationTemplate_1.notificationTemplate.notificationMessageTemplate(templateParams);
        yield addChatMessage_1.addChatMessage.message(req, res);
        expect(email_queue_1.emailQueue.addEmailJob).toHaveBeenCalledWith('directMessageEmail', {
            receiverEmail: user_mock_1.existingUserTwo.email,
            template,
            subject: `You've received messages from ${req.currentUser.username}`,
        });
    }));
    it('should not call addEmailJob method', () => __awaiter(void 0, void 0, void 0, function* () {
        chat_mock_1.chatMessage.isRead = true;
        const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessageBody, auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(user_mock_1.mergedAuthAndUserData);
        jest.spyOn(email_queue_1.emailQueue, 'addEmailJob');
        const templateParams = {
            username: user_mock_1.existingUserTwo.username,
            message: chat_mock_1.chatMessage.body,
            header: `Message Notification from ${req.currentUser.username}`,
        };
        const template = notificationTemplate_1.notificationTemplate.notificationMessageTemplate(templateParams);
        yield addChatMessage_1.addChatMessage.message(req, res);
        expect(email_queue_1.emailQueue.addEmailJob).not.toHaveBeenCalledWith('directMessageMail', {
            receiverEmail: req.currentUser.email,
            template,
            subject: `You've received messages from ${user_mock_1.existingUserTwo.username}`,
        });
    }));
    it('should call addChatListToCache twice', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(chat_cache_1.ChatCache.prototype, 'addChatListToCache');
        const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessageBody, auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(user_mock_1.mergedAuthAndUserData);
        yield addChatMessage_1.addChatMessage.message(req, res);
        expect(chat_cache_1.ChatCache.prototype.addChatListToCache).toHaveBeenCalledTimes(2);
    }));
    it('should call addChatMessageToCache', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(chat_cache_1.ChatCache.prototype, 'addChatMessageToCache');
        const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessageBody, auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(user_mock_1.mergedAuthAndUserData);
        yield addChatMessage_1.addChatMessage.message(req, res);
        expect(chat_cache_1.ChatCache.prototype.addChatMessageToCache).toHaveBeenCalledTimes(1);
    }));
    it('should call chatQueue addChatJob', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(chat_queue_1.chatQueue, 'addChatJob');
        const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessageBody, auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(user_mock_1.mergedAuthAndUserData);
        yield addChatMessage_1.addChatMessage.message(req, res);
        expect(chat_queue_1.chatQueue.addChatJob).toHaveBeenCalledTimes(1);
    }));
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessageBody, auth_mock_1.authUserPayload);
        const res = (0, chat_mock_1.chatMockResponse)();
        jest.spyOn(user_service_1.userService, 'getUserById').mockResolvedValue(user_mock_1.mergedAuthAndUserData);
        yield addChatMessage_1.addChatMessage.message(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Message added',
            conversationId: new mongoose_1.Types.ObjectId(`${chat_mock_1.chatMessage.conversationId}`),
        });
    }));
});
//# sourceMappingURL=addChatMessage.test.js.map