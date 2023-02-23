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
exports.removeReactions = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const reactions_1 = require("../schemas/reactions");
const post_service_1 = require("../../../shared/services/db/post.service");
const reaction_cache_1 = require("../../../shared/services/redis/reaction.cache");
const reaction_queue_1 = require("../../../shared/services/queues/reaction.queue");
const reactionCache = new reaction_cache_1.ReactionsCache();
class RemoveReactions {
    reactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.body;
            if (!helpers_1.Helpers.checkValidObjectId(postId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const existingPost = yield post_service_1.postService.findPostById(postId);
            if (!existingPost) {
                throw new errorHandler_1.BadRequestError('Post was not found');
            }
            const previousReaction = req.body.previousReaction;
            if (existingPost.reactions && existingPost.reactions[previousReaction] === 0) {
                throw new errorHandler_1.BadRequestError('Reaction count for post reactions must be positive integer');
            }
            yield reactionCache.removePostReactionFromCache(postId, `${req.currentUser.username}`, previousReaction);
            const reactionData = {
                postId,
                username: req.currentUser.username,
                previousReaction,
            };
            reaction_queue_1.reactionQueue.addReactionJob('removeReactionDataFromDb', reactionData);
            res.status(http_status_codes_1.default.OK).json({ message: 'Reaction removed from post successfully.' });
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(reactions_1.removeReactionSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RemoveReactions.prototype, "reactions", null);
exports.removeReactions = new RemoveReactions();
//# sourceMappingURL=removeReaction.js.map