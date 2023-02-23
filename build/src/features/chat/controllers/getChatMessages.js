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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatMessages = exports.GetChatMessages = void 0;
const mongoose_1 = require("mongoose");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const chat_service_1 = require("../../../shared/services/db/chat.service");
const chat_cache_1 = require("../../../shared/services/redis/chat.cache");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const chatCache = new chat_cache_1.ChatCache();
class GetChatMessages {
    conversationList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = [];
            const cachedList = yield chatCache.getUserConversationList(`${req.currentUser.userId}`);
            if (cachedList.length) {
                list = cachedList;
            }
            else {
                list = yield chat_service_1.chatService.getUserConversationList(new mongoose_1.Types.ObjectId(req.currentUser.userId));
            }
            res.status(http_status_codes_1.default.OK).json({ message: 'User conversation list', list });
        });
    }
    messages(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { receiverId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(receiverId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            if (receiverId === `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            let messages = [];
            const cachedMessages = yield chatCache.getChatMessagesFromCache(`${req.currentUser.userId}`, `${receiverId}`);
            if (cachedMessages.length) {
                messages = cachedMessages;
            }
            else {
                messages = yield chat_service_1.chatService.getMessages(new mongoose_1.Types.ObjectId(req.currentUser.userId), new mongoose_1.Types.ObjectId(receiverId), { createdAt: -1 });
            }
            res.status(http_status_codes_1.default.OK).json({ message: 'User chat messages', messages });
        });
    }
}
exports.GetChatMessages = GetChatMessages;
exports.getChatMessages = new GetChatMessages();
//# sourceMappingURL=getChatMessages.js.map