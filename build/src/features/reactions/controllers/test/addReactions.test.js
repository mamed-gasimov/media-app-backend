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
const reaction_cache_1 = require("../../../../shared/services/redis/reaction.cache");
const reaction_queue_1 = require("../../../../shared/services/queues/reaction.queue");
const addReactions_1 = require("../../controllers/addReactions");
const post_service_1 = require("../../../../shared/services/db/post.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');
describe('Add reaction to post', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if reaction type is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, Object.assign(Object.assign({}, reactions_mock_1.reactionMock), { type: '' }), auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        addReactions_1.addReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"type" must be one of [like, love, happy, wow, sad, angry]');
        });
    }));
    it('should throw an error if reaction type is not one of [like, love, happy, wow, sad, angry]', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, Object.assign(Object.assign({}, reactions_mock_1.reactionMock), { type: 'random word' }), auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        addReactions_1.addReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"type" must be one of [like, love, happy, wow, sad, angry]');
        });
    }));
    it('should throw an error if previousReaction is not one of [like, love, happy, wow, sad, angry, null, ]', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, Object.assign(Object.assign({}, reactions_mock_1.reactionMock), { previousReaction: 'random word' }), auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        addReactions_1.addReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"previousReaction" must be one of [like, love, happy, wow, sad, angry, null, ]');
        });
    }));
    it('should throw an error if postId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, Object.assign(Object.assign({}, reactions_mock_1.reactionMock), { postId: '' }), auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        addReactions_1.addReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"postId" is not allowed to be empty');
        });
    }));
    it('should throw an error if postId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, Object.assign(Object.assign({}, reactions_mock_1.reactionMock), { postId: '12345' }), auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        addReactions_1.addReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if post does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, reactions_mock_1.reactionMock, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve(null));
        addReactions_1.addReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Post was not found');
        });
    }));
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, reactions_mock_1.reactionMock, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
        const spy = jest.spyOn(reaction_cache_1.ReactionsCache.prototype, 'savePostReactionToCache');
        const reactionSpy = jest.spyOn(reaction_queue_1.reactionQueue, 'addReactionJob');
        yield addReactions_1.addReactions.reactions(req, res);
        expect(reaction_cache_1.ReactionsCache.prototype.savePostReactionToCache).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1], spy.mock.calls[0][2], spy.mock.calls[0][3]);
        expect(reaction_queue_1.reactionQueue.addReactionJob).toHaveBeenCalledWith(reactionSpy.mock.calls[0][0], reactionSpy.mock.calls[0][1]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Reaction added successfully.',
        });
    }));
});
//# sourceMappingURL=addReactions.test.js.map