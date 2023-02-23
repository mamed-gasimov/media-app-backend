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
exports.getComments = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = require("mongoose");
const comment_cache_1 = require("../../../shared/services/redis/comment.cache");
const comment_service_1 = require("../../../shared/services/db/comment.service");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const commentsCache = new comment_cache_1.CommentsCache();
class GetComments {
    comments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(postId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const cachedComments = yield commentsCache.getPostCommentsFromCache(postId);
            const comments = cachedComments.length
                ? cachedComments
                : yield comment_service_1.commentService.getPostCommentsFromDb({ postId: new mongoose_1.Types.ObjectId(postId) }, { createdAt: -1 });
            res.status(http_status_codes_1.default.OK).json({ message: 'Post comments', comments });
        });
    }
    commentNames(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(postId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const cachedCommentsNames = yield commentsCache.getCommentsNamesFromCache(postId);
            const commentsNames = cachedCommentsNames.length
                ? cachedCommentsNames
                : yield comment_service_1.commentService.getPostCommentNamesFromDb({ postId: new mongoose_1.Types.ObjectId(postId) }, { createdAt: -1 });
            res
                .status(http_status_codes_1.default.OK)
                .json({ message: 'Post comments names', comments: commentsNames.length ? commentsNames[0] : [] });
        });
    }
    singleComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, commentId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(postId) || !helpers_1.Helpers.checkValidObjectId(commentId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const cachedComments = yield commentsCache.getSingleCommentFromCache(postId, commentId);
            const comments = cachedComments.length
                ? cachedComments
                : yield comment_service_1.commentService.getPostCommentsFromDb({ _id: new mongoose_1.Types.ObjectId(commentId) }, { createdAt: -1 });
            res
                .status(http_status_codes_1.default.OK)
                .json({ message: 'Single comment', comments: comments.length ? comments[0] : [] });
        });
    }
}
exports.getComments = new GetComments();
//# sourceMappingURL=getComments.js.map