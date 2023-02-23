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
exports.deletePost = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const post_service_1 = require("../../../shared/services/db/post.service");
const post_queue_1 = require("../../../shared/services/queues/post.queue");
const post_cache_1 = require("../../../shared/services/redis/post.cache");
const post_sockets_1 = require("../../../shared/sockets/post.sockets");
const postCache = new post_cache_1.PostCache();
class DeletePost {
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(postId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const existingPost = yield post_service_1.postService.findPostById(postId);
            if (!existingPost) {
                throw new errorHandler_1.BadRequestError('Post was not found');
            }
            post_sockets_1.socketIOPostObject.emit('delete post', postId);
            yield postCache.deletePostFromCache(postId, req.currentUser.userId);
            post_queue_1.postQueue.addPostJob('deletePostFromDb', { keyOne: postId, keyTwo: req.currentUser.userId });
            res.status(http_status_codes_1.default.OK).json({ message: 'Post deleted successfully' });
        });
    }
}
exports.deletePost = new DeletePost();
//# sourceMappingURL=deletePost.js.map