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
const updateChatMessage_1 = require("../../controllers/updateChatMessage");
const chatServer = __importStar(require("../../../../shared/sockets/chat.sockets"));
const chat_mock_1 = require("../../../../mocks/chat.mock");
const chat_cache_1 = require("../../../../shared/services/redis/chat.cache");
const chat_queue_1 = require("../../../../shared/services/queues/chat.queue");
const chat_mock_2 = require("../../../../mocks/chat.mock");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/chat.cache');
Object.defineProperties(chatServer, {
    socketIOChatObject: {
        value: new socket_io_1.Server(),
        writable: true,
    },
});
describe('Update Chat Message', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('message', () => {
        it('should throw an error if receiverId is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, { receiverId: '' }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            updateChatMessage_1.updateChatMessage.markMessageAsRead(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"receiverId" is not allowed to be empty');
            });
        }));
        it('should throw an error if receiverId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, { receiverId: '12345' }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            updateChatMessage_1.updateChatMessage.markMessageAsRead(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if receiverId is equal to current user id', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, { receiverId: auth_mock_1.authUserPayload.userId }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            updateChatMessage_1.updateChatMessage.markMessageAsRead(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should send correct json response from redis cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, { receiverId: '60263f14648fed5246e322d8' }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_cache_1.ChatCache.prototype, 'updateChatMessages').mockResolvedValue(chat_mock_2.messageDataMock);
            jest.spyOn(chatServer.socketIOChatObject, 'emit');
            yield updateChatMessage_1.updateChatMessage.markMessageAsRead(req, res);
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('message read', chat_mock_2.messageDataMock);
            expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('chat list', chat_mock_2.messageDataMock);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Message marked as read',
            });
        }));
        it('should call chatQueue addChatJob', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, chat_mock_1.chatMockRequest)({}, { receiverId: '60263f14648fed5246e322d8' }, auth_mock_1.authUserPayload);
            const res = (0, chat_mock_1.chatMockResponse)();
            jest.spyOn(chat_cache_1.ChatCache.prototype, 'updateChatMessages').mockResolvedValue(chat_mock_2.messageDataMock);
            jest.spyOn(chat_queue_1.chatQueue, 'addChatJob');
            yield updateChatMessage_1.updateChatMessage.markMessageAsRead(req, res);
            expect(chat_queue_1.chatQueue.addChatJob).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Message marked as read',
            });
        }));
    });
});
//# sourceMappingURL=updateChatMessage.test.js.map