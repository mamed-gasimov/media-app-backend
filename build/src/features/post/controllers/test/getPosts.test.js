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
Object.defineProperty(exports, "__esModule", { value: true });
const getPosts_1 = require("../../controllers/getPosts");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const post_mock_1 = require("../../../../mocks/post.mock");
const post_service_1 = require("../../../../shared/services/db/post.service");
const post_cache_1 = require("../../../../shared/services/redis/post.cache");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');
describe('Get Posts', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('posts', () => {
        it('should send correct json response if posts exist in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.newPost, auth_mock_1.authUserPayload, { page: '1' });
            const res = (0, post_mock_1.postMockResponse)();
            jest.spyOn(post_cache_1.PostCache.prototype, 'getPostsFromCache').mockResolvedValue([post_mock_1.postMockData]);
            jest.spyOn(post_cache_1.PostCache.prototype, 'getTotalPostNumberFromCache').mockResolvedValue(1);
            yield getPosts_1.getPosts.posts(req, res);
            expect(post_cache_1.PostCache.prototype.getPostsFromCache).toHaveBeenCalledWith('post', 0, 10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'All posts',
                posts: [post_mock_1.postMockData],
                totalPosts: 1,
            });
        }));
        it('should send correct json response if posts exist in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.newPost, auth_mock_1.authUserPayload, { page: '1' });
            const res = (0, post_mock_1.postMockResponse)();
            jest.spyOn(post_cache_1.PostCache.prototype, 'getPostsFromCache').mockResolvedValue([]);
            jest.spyOn(post_cache_1.PostCache.prototype, 'getTotalPostNumberFromCache').mockResolvedValue(0);
            jest.spyOn(post_service_1.postService, 'getPosts').mockResolvedValue([post_mock_1.postMockData]);
            jest.spyOn(post_service_1.postService, 'postCount').mockResolvedValue(1);
            yield getPosts_1.getPosts.posts(req, res);
            expect(post_service_1.postService.getPosts).toHaveBeenCalledWith({}, 0, 10, { createdAt: -1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'All posts',
                posts: [post_mock_1.postMockData],
                totalPosts: 1,
            });
        }));
        it('should send empty posts', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.newPost, auth_mock_1.authUserPayload, { page: '1' });
            const res = (0, post_mock_1.postMockResponse)();
            jest.spyOn(post_cache_1.PostCache.prototype, 'getPostsFromCache').mockResolvedValue([]);
            jest.spyOn(post_cache_1.PostCache.prototype, 'getTotalPostNumberFromCache').mockResolvedValue(0);
            jest.spyOn(post_service_1.postService, 'getPosts').mockResolvedValue([]);
            jest.spyOn(post_service_1.postService, 'postCount').mockResolvedValue(0);
            yield getPosts_1.getPosts.posts(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'All posts',
                posts: [],
                totalPosts: 0,
            });
        }));
    });
});
//# sourceMappingURL=getPosts.test.js.map