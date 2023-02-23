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
exports.getReactions = void 0;
const mongoose_1 = require("mongoose");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const post_service_1 = require("../../../shared/services/db/post.service");
const reaction_cache_1 = require("../../../shared/services/redis/reaction.cache");
const reaction_service_1 = require("../../../shared/services/db/reaction.service");
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const reactions_1 = require("../schemas/reactions");
const reactionCache = new reaction_cache_1.ReactionsCache();
class GetReactions {
    reactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(postId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const existingPost = yield post_service_1.postService.findPostById(postId);
            if (!existingPost) {
                throw new errorHandler_1.BadRequestError('Post was not found');
            }
            const cachedReactions = yield reactionCache.getReactionsFromCache(postId);
            const reactions = cachedReactions.length
                ? cachedReactions
                : yield reaction_service_1.reactionService.getPostReactions({ postId: new mongoose_1.Types.ObjectId(postId) }, { createdAt: -1 });
            res.status(http_status_codes_1.default.OK).json({ message: 'Post reactions', reactions });
        });
    }
    singleReactionByUsername(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, username } = req.body;
            if (!helpers_1.Helpers.checkValidObjectId(postId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const existingPost = yield post_service_1.postService.findPostById(postId);
            if (!existingPost) {
                throw new errorHandler_1.BadRequestError('Post was not found');
            }
            const cachedReaction = yield reactionCache.getSingleReactionFromCache(postId, username);
            const reaction = cachedReaction
                ? cachedReaction
                : yield reaction_service_1.reactionService.getSinglePostReactionByUsername(postId, username);
            res.status(http_status_codes_1.default.OK).json({
                message: 'Single post reaction by username',
                reactions: reaction || {},
            });
        });
    }
    reactionsByUsername(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = req.body;
            const reactions = yield reaction_service_1.reactionService.getReactionsByUsername(username);
            res.status(http_status_codes_1.default.OK).json({ message: 'All user reactions by username', reactions });
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(reactions_1.singleReactionByUsernameSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GetReactions.prototype, "singleReactionByUsername", null);
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(reactions_1.reactionsByUsernameSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GetReactions.prototype, "reactionsByUsername", null);
exports.getReactions = new GetReactions();
//# sourceMappingURL=getReactions.js.map