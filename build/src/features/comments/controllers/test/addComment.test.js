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
/* eslint-disable @typescript-eslint/no-explicit-any */
const auth_mock_1 = require("../../../../mocks/auth.mock");
const reactions_mock_1 = require("../../../../mocks/reactions.mock");
const comment_cache_1 = require("../../../../shared/services/redis/comment.cache");
const comment_queue_1 = require("../../../../shared/services/queues/comment.queue");
const addComment_1 = require("../../controllers/addComment");
const post_service_1 = require("../../../../shared/services/db/post.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/comment.cache');
describe('Add Post Comment', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if postId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, {
            postId: '',
            comment: 'This is a comment',
            profilePicture: 'https://place-hold.it/500x500',
        }, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        addComment_1.addComment.comments(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"postId" is not allowed to be empty');
        });
    }));
    it('should throw an error if postId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, {
            postId: '12345',
            comment: 'This is a comment',
            profilePicture: 'https://place-hold.it/500x500',
        }, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        addComment_1.addComment.comments(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if comment is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, {
            postId: '6027f77087c9d9ccb1555268',
            comment: '',
            profilePicture: 'https://place-hold.it/500x500',
        }, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        addComment_1.addComment.comments(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"comment" is not allowed to be empty');
        });
    }));
    it('should throw an error if post does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, {
            postId: '6027f77087c9d9ccb1555268',
            comment: 'This is a comment',
            profilePicture: 'https://place-hold.it/500x500',
        }, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve(null));
        addComment_1.addComment.comments(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Post was not found');
        });
    }));
    it('should call savePostCommentToCache and addCommentJob methods', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, {
            postId: '6027f77087c9d9ccb1555268',
            comment: 'This is a comment',
            profilePicture: 'https://place-hold.it/500x500',
        }, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
        jest.spyOn(comment_cache_1.CommentsCache.prototype, 'savePostCommentToCache');
        jest.spyOn(comment_queue_1.commentQueue, 'addPostCommentJob');
        yield addComment_1.addComment.comments(req, res);
        expect(comment_cache_1.CommentsCache.prototype.savePostCommentToCache).toHaveBeenCalled();
        expect(comment_queue_1.commentQueue.addPostCommentJob).toHaveBeenCalled();
    }));
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, {
            postId: '6027f77087c9d9ccb1555268',
            comment: 'This is a comment',
            profilePicture: 'https://place-hold.it/500x500',
        }, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
        yield addComment_1.addComment.comments(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Comment added successfully.',
        });
    }));
});
//# sourceMappingURL=addComment.test.js.map