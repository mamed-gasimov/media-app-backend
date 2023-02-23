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
const socket_io_1 = require("socket.io");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const chatServer = __importStar(require("../../../../shared/sockets/chat.sockets"));
const chat_mock_1 = require("../../../../mocks/chat.mock");
const chat_cache_1 = require("../../../../shared/services/redis/chat.cache");
const chat_queue_1 = require("../../../../shared/services/queues/chat.queue");
const chat_mock_2 = require("../../../../mocks/chat.mock");
const addMessageReaction_1 = require("../../controllers/addMessageReaction");
const chat_service_1 = require("../../../../shared/services/db/chat.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/chat.cache');
Object.defineProperties(chatServer, {
    socketIOChatObject: {
        value: new socket_io_1.Server(),
        writable: true,
    },
});
describe('Add Message Reaction', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('message', () => {
        it('should throw an error if conversationId is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, { conversationId: '', messageId: `${chat_mock_1.mockMessageId}`, reaction: 'love', type: 'add' }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            addMessageReaction_1.addMessageReaction.reaction(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"conversationId" is not allowed to be empty');
            });
        }));
        it('should throw an error if conversationId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, { conversationId: '12345', messageId: `${chat_mock_1.mockMessageId}`, reaction: 'love', type: 'add' }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            addMessageReaction_1.addMessageReaction.reaction(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if messageId is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, { conversationId: '602854c81c9ca7939aaeba43', messageId: '', reaction: 'love', type: 'add' }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            addMessageReaction_1.addMessageReaction.reaction(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"messageId" is not allowed to be empty');
            });
        }));
        it('should throw an error if messageId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, { conversationId: '602854c81c9ca7939aaeba43', messageId: '12345', reaction: 'love', type: 'add' }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            addMessageReaction_1.addMessageReaction.reaction(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if reaction is not one of [like, love, happy, wow, sad, angry]', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, {
                conversationId: '602854c81c9ca7939aaeba43',
                messageId: `${chat_mock_1.mockMessageId}`,
                reaction: 'test',
                type: 'add',
            }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            addMessageReaction_1.addMessageReaction.reaction(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"reaction" must be one of [like, love, happy, wow, sad, angry]');
            });
        }));
        it('should throw an error if type is not one of [add, remove]', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, {
                conversationId: '602854c81c9ca7939aaeba43',
                messageId: `${chat_mock_1.mockMessageId}`,
                reaction: 'love',
                type: 'test',
            }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            addMessageReaction_1.addMessageReaction.reaction(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"type" must be one of [add, remove]');
            });
        }));
        it('should throw an error if message with this messageId was not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, {
                conversationId: '602854c81c9ca7939aaeba43',
                messageId: `${chat_mock_1.mockMessageId}`,
                reaction: 'love',
                type: 'add',
            }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_service_1.chatService, 'getMessageById').mockResolvedValue(null);
            addMessageReaction_1.addMessageReaction.reaction(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Message was not found');
            });
        }));
        it('should call updateMessageReaction', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, {
                conversationId: '602854c81c9ca7939aaeba43',
                messageId: `${chat_mock_1.mockMessageId}`,
                reaction: 'love',
                type: 'add',
            }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_service_1.chatService, 'getMessageById').mockResolvedValue(chat_mock_2.messageDataMock);
            jest.spyOn(chat_cache_1.ChatCache.prototype, 'updateMessageReaction').mockResolvedValue(chat_mock_2.messageDataMock);
            jest.spyOn(chatServer.socketIOChatObject, 'emit');
            yield addMessageReaction_1.addMessageReaction.reaction(req, res);
            expect(chat_cache_1.ChatCache.prototype.updateMessageReaction).toHaveBeenCalledWith('602854c81c9ca7939aaeba43', `${chat_mock_1.mockMessageId}`, 'love', 'add', 'sender');
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(1);
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('message reaction', chat_mock_2.messageDataMock);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Message reaction added',
            });
        }));
        it('should call chatQueue addChatJob', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, {
                conversationId: '602854c81c9ca7939aaeba43',
                messageId: `${chat_mock_1.mockMessageId}`,
                reaction: 'love',
                type: 'add',
            }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_service_1.chatService, 'getMessageById').mockResolvedValue(chat_mock_2.messageDataMock);
            jest.spyOn(chat_queue_1.chatQueue, 'addChatJob');
            yield addMessageReaction_1.addMessageReaction.reaction(req, res);
            expect(chat_queue_1.chatQueue.addChatJob).toHaveBeenCalledWith('updateMessageReaction', {
                messageId: chat_mock_1.mockMessageId,
                senderName: req.currentUser.username,
                reaction: 'love',
                type: 'add',
                userType: 'sender',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Message reaction added',
            });
        }));
    });
});
//# sourceMappingURL=addMessageReaction.test.js.map