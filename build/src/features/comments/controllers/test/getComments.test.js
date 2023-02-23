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
const mongoose_1 = require("mongoose");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const reactions_mock_1 = require("../../../../mocks/reactions.mock");
const comment_cache_1 = require("../../../../shared/services/redis/comment.cache");
const getComments_1 = require("../../controllers/getComments");
const comment_service_1 = require("../../../../shared/services/db/comment.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/comment.cache');
describe('Get Post Comments', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('comments', () => {
        it('should throw an error if postId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getComments_1.getComments.comments(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if postId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '12345',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getComments_1.getComments.comments(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should send correct json response if comments exist in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '6027f77087c9d9ccb1555268',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(comment_cache_1.CommentsCache.prototype, 'getPostCommentsFromCache').mockResolvedValue([reactions_mock_1.commentsData]);
            yield getComments_1.getComments.comments(req, res);
            expect(comment_cache_1.CommentsCache.prototype.getPostCommentsFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post comments',
                comments: [reactions_mock_1.commentsData],
            });
        }));
        it('should send correct json response if comments exist in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '6027f77087c9d9ccb1555268',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(comment_cache_1.CommentsCache.prototype, 'getPostCommentsFromCache').mockResolvedValue([]);
            jest.spyOn(comment_service_1.commentService, 'getPostCommentsFromDb').mockResolvedValue([reactions_mock_1.commentsData]);
            yield getComments_1.getComments.comments(req, res);
            expect(comment_service_1.commentService.getPostCommentsFromDb).toHaveBeenCalledWith({ postId: new mongoose_1.Types.ObjectId('6027f77087c9d9ccb1555268') }, { createdAt: -1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post comments',
                comments: [reactions_mock_1.commentsData],
            });
        }));
    });
    describe('post comment names', () => {
        it('should throw an error if postId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getComments_1.getComments.comments(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if postId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '12345',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getComments_1.getComments.comments(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should send correct json response if data exist in redis', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '6027f77087c9d9ccb1555268',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(comment_cache_1.CommentsCache.prototype, 'getCommentsNamesFromCache').mockResolvedValue([reactions_mock_1.commentNames]);
            yield getComments_1.getComments.commentNames(req, res);
            expect(comment_cache_1.CommentsCache.prototype.getCommentsNamesFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post comments names',
                comments: reactions_mock_1.commentNames,
            });
        }));
        it('should send correct json response if data exist in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '6027f77087c9d9ccb1555268',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(comment_cache_1.CommentsCache.prototype, 'getCommentsNamesFromCache').mockResolvedValue([]);
            jest.spyOn(comment_service_1.commentService, 'getPostCommentNamesFromDb').mockResolvedValue([reactions_mock_1.commentNames]);
            yield getComments_1.getComments.commentNames(req, res);
            expect(comment_service_1.commentService.getPostCommentNamesFromDb).toHaveBeenCalledWith({ postId: new mongoose_1.Types.ObjectId('6027f77087c9d9ccb1555268') }, { createdAt: -1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post comments names',
                comments: reactions_mock_1.commentNames,
            });
        }));
        it('should return empty comments if data does not exist in redis and database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '6027f77087c9d9ccb1555268',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(comment_cache_1.CommentsCache.prototype, 'getCommentsNamesFromCache').mockResolvedValue([]);
            jest.spyOn(comment_service_1.commentService, 'getPostCommentNamesFromDb').mockResolvedValue([]);
            yield getComments_1.getComments.commentNames(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post comments names',
                comments: [],
            });
        }));
    });
    describe('singleComment', () => {
        it('should throw an error if postId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '',
                commentId: '6064861bc25eaa5a5d2f9bf4',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getComments_1.getComments.comments(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if postId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '12345',
                commentId: '6064861bc25eaa5a5d2f9bf4',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getComments_1.getComments.comments(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if commentId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '6064861bc25eaa5a5d2f9bf4',
                commentId: '',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getComments_1.getComments.comments(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if commentId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '6064861bc25eaa5a5d2f9bf4',
                commentId: '12345',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getComments_1.getComments.comments(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should send correct json response from cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                commentId: '6064861bc25eaa5a5d2f9bf4',
                postId: '6027f77087c9d9ccb1555268',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(comment_cache_1.CommentsCache.prototype, 'getSingleCommentFromCache').mockResolvedValue([reactions_mock_1.commentsData]);
            yield getComments_1.getComments.singleComment(req, res);
            expect(comment_cache_1.CommentsCache.prototype.getSingleCommentFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268', '6064861bc25eaa5a5d2f9bf4');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single comment',
                comments: reactions_mock_1.commentsData,
            });
        }));
        it('should send correct json response from database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                commentId: '6064861bc25eaa5a5d2f9bf4',
                postId: '6027f77087c9d9ccb1555268',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(comment_cache_1.CommentsCache.prototype, 'getSingleCommentFromCache').mockResolvedValue([]);
            jest.spyOn(comment_service_1.commentService, 'getPostCommentsFromDb').mockResolvedValue([reactions_mock_1.commentsData]);
            yield getComments_1.getComments.singleComment(req, res);
            expect(comment_service_1.commentService.getPostCommentsFromDb).toHaveBeenCalledWith({ _id: new mongoose_1.Types.ObjectId('6064861bc25eaa5a5d2f9bf4') }, { createdAt: -1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single comment',
                comments: reactions_mock_1.commentsData,
            });
        }));
    });
});
//# sourceMappingURL=getComments.test.js.map