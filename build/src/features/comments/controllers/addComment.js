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
exports.addComment = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongodb_1 = require("mongodb");
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const comment_cache_1 = require("../../../shared/services/redis/comment.cache");
const comment_1 = require("../schemas/comment");
const comment_queue_1 = require("../../../shared/services/queues/comment.queue");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const post_service_1 = require("../../../shared/services/db/post.service");
const commentCache = new comment_cache_1.CommentsCache();
class AddComment {
    comments(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, profilePicture, comment } = req.body;
            if (!helpers_1.Helpers.checkValidObjectId(postId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const existingPost = yield post_service_1.postService.findPostById(postId);
            if (!existingPost) {
                throw new errorHandler_1.BadRequestError('Post was not found');
            }
            const commentObjectId = new mongodb_1.ObjectId();
            const commentData = {
                _id: commentObjectId,
                postId,
                username: `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.username}`,
                avatarColor: `${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.avatarColor}`,
                profilePicture,
                comment,
                createdAt: new Date(),
            };
            yield commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));
            const databaseCommentData = {
                postId,
                userTo: existingPost.userId,
                userFrom: req.currentUser.userId,
                username: req.currentUser.username,
                comment: commentData,
            };
            comment_queue_1.commentQueue.addPostCommentJob('addPostCommentToDb', databaseCommentData);
            res.status(http_status_codes_1.default.OK).json({ message: 'Comment added successfully.' });
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(comment_1.addCommentSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AddComment.prototype, "comments", null);
exports.addComment = new AddComment();
//# sourceMappingURL=addComment.js.map