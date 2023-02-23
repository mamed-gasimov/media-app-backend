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
exports.getPosts = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const post_service_1 = require("../../../shared/services/db/post.service");
const post_cache_1 = require("../../../shared/services/redis/post.cache");
const postCache = new post_cache_1.PostCache();
const PAGE_SIZE = 10;
class GetPosts {
    posts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page } = req.params;
            if (!Number.isInteger(+page) || +page <= 0) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const skip = (parseInt(page) - 1) * PAGE_SIZE;
            const limit = parseInt(page) * PAGE_SIZE;
            const skipForRedis = skip === 0 ? skip : skip + 1;
            let posts = [];
            let totalPosts = 0;
            const cachedPosts = yield postCache.getPostsFromCache('post', skipForRedis, limit);
            if (cachedPosts.length) {
                posts = cachedPosts;
                totalPosts = yield postCache.getTotalPostNumberFromCache();
            }
            else {
                posts = yield post_service_1.postService.getPosts({}, skip, limit, { createdAt: -1 });
                totalPosts = yield post_service_1.postService.postCount();
            }
            res.status(http_status_codes_1.default.OK).json({ message: 'All posts', posts, totalPosts });
        });
    }
}
exports.getPosts = new GetPosts();
//# sourceMappingURL=getPosts.js.map