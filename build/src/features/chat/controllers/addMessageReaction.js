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
exports.addMessageReaction = exports.AddMessageReaction = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = require("mongoose");
const chat_cache_1 = require("../../../shared/services/redis/chat.cache");
const chat_sockets_1 = require("../../../shared/sockets/chat.sockets");
const chat_queue_1 = require("../../../shared/services/queues/chat.queue");
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const chat_1 = require("../schemas/chat");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const chat_service_1 = require("../../../shared/services/db/chat.service");
const chatCache = new chat_cache_1.ChatCache();
class AddMessageReaction {
    reaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { conversationId, messageId, reaction, type } = req.body;
            if (!helpers_1.Helpers.checkValidObjectId(conversationId) || !helpers_1.Helpers.checkValidObjectId(messageId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const messageObjectId = new mongoose_1.Types.ObjectId(messageId);
            const message = yield chat_service_1.chatService.getMessageById(messageObjectId);
            if (!message) {
                throw new errorHandler_1.BadRequestError('Message was not found');
            }
            let userType;
            if (message.senderUsername === req.currentUser.username) {
                userType = 'sender';
            }
            else if (message.receiverUsername === req.currentUser.username) {
                userType = 'receiver';
            }
            const updatedMessage = yield chatCache.updateMessageReaction(`${conversationId}`, `${messageId}`, `${reaction}`, type, userType);
            chat_sockets_1.socketIOChatObject.emit('message reaction', updatedMessage);
            chat_queue_1.chatQueue.addChatJob('updateMessageReaction', {
                messageId: messageObjectId,
                senderName: req.currentUser.username,
                reaction,
                type,
                userType,
            });
            res.status(http_status_codes_1.default.OK).json({ message: `Message reaction ${type === 'add' ? 'added' : 'removed'}` });
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(chat_1.addMessageReactionSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AddMessageReaction.prototype, "reaction", null);
exports.AddMessageReaction = AddMessageReaction;
exports.addMessageReaction = new AddMessageReaction();
//# sourceMappingURL=addMessageReaction.js.map