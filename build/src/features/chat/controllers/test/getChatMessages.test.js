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
const auth_mock_1 = require("../../../../mocks/auth.mock");
const chat_mock_1 = require("../../../../mocks/chat.mock");
const chat_cache_1 = require("../../../../shared/services/redis/chat.cache");
const getChatMessages_1 = require("../../controllers/getChatMessages");
const chat_service_1 = require("../../../../shared/services/db/chat.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/chat.cache');
describe('Get Chat Messages', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('conversationList', () => {
        it('should send correct json response if chat list exist in redis', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, {}, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_cache_1.ChatCache.prototype, 'getUserConversationList').mockResolvedValue([chat_mock_1.messageDataMock]);
            yield getChatMessages_1.getChatMessages.conversationList(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User conversation list',
                list: [chat_mock_1.messageDataMock],
            });
        }));
        it('should send correct json response if no chat list response from redis', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, {}, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_cache_1.ChatCache.prototype, 'getUserConversationList').mockResolvedValue([]);
            jest.spyOn(chat_service_1.chatService, 'getUserConversationList').mockResolvedValue([chat_mock_1.messageDataMock]);
            yield getChatMessages_1.getChatMessages.conversationList(req, res);
            expect(chat_service_1.chatService.getUserConversationList).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User conversation list',
                list: [chat_mock_1.messageDataMock],
            });
        }));
        it('should send correct json response with empty chat list if it does not exist (redis & database)', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessage, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_cache_1.ChatCache.prototype, 'getUserConversationList').mockResolvedValue([]);
            jest.spyOn(chat_service_1.chatService, 'getUserConversationList').mockResolvedValue([]);
            yield getChatMessages_1.getChatMessages.conversationList(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User conversation list',
                list: [],
            });
        }));
    });
    describe('messages', () => {
        it('should throw an error if receiverId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessage, auth_mock_1.authUserPayload, {});
            const res = (0, chat_mock_1.chatMockResponse)();
            getChatMessages_1.getChatMessages.messages(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if receiverId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessage, auth_mock_1.authUserPayload, {
                receiverId: '12345',
            });
            const res = (0, chat_mock_1.chatMockResponse)();
            getChatMessages_1.getChatMessages.messages(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if receiverId is equal to current user id', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessage, auth_mock_1.authUserPayload, {
                receiverId: auth_mock_1.authUserPayload.userId,
            });
            const res = (0, chat_mock_1.chatMockResponse)();
            getChatMessages_1.getChatMessages.messages(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should send correct json response if chat messages exist in redis', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessage, auth_mock_1.authUserPayload, {
                receiverId: '60263f14648fed5246e322d8',
            });
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_cache_1.ChatCache.prototype, 'getChatMessagesFromCache').mockResolvedValue([chat_mock_1.messageDataMock]);
            yield getChatMessages_1.getChatMessages.messages(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat messages',
                messages: [chat_mock_1.messageDataMock],
            });
        }));
        it('should send correct json response if no chat message response from redis', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessage, auth_mock_1.authUserPayload, {
                receiverId: '60263f14648fed5246e322d8',
            });
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_cache_1.ChatCache.prototype, 'getChatMessagesFromCache').mockResolvedValue([]);
            jest.spyOn(chat_service_1.chatService, 'getMessages').mockResolvedValue([chat_mock_1.messageDataMock]);
            yield getChatMessages_1.getChatMessages.messages(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat messages',
                messages: [chat_mock_1.messageDataMock],
            });
        }));
        it('should send correct json response with empty chat messages if it does not exist (redis & database)', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, chat_mock_1.chatMessage, auth_mock_1.authUserPayload, {
                receiverId: '6064793b091bf02b6a71067a',
            });
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_cache_1.ChatCache.prototype, 'getChatMessagesFromCache').mockResolvedValue([]);
            jest.spyOn(chat_service_1.chatService, 'getMessages').mockResolvedValue([]);
            yield getChatMessages_1.getChatMessages.messages(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User chat messages',
                messages: [],
            });
        }));
    });
});
//# sourceMappingURL=getChatMessages.test.js.map