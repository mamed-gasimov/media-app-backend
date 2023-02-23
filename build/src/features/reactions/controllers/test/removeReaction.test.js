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
const reactions_mock_1 = require("../../../../mocks/reactions.mock");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const reaction_cache_1 = require("../../../../shared/services/redis/reaction.cache");
const reaction_queue_1 = require("../../../../shared/services/queues/reaction.queue");
const removeReaction_1 = require("../../controllers/removeReaction");
const post_service_1 = require("../../../../shared/services/db/post.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');
describe('Remove reaction from post', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if postId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, Object.assign(Object.assign({}, reactions_mock_1.removeReactionMock), { postId: '' }), auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        removeReaction_1.removeReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"postId" is not allowed to be empty');
        });
    }));
    it('should throw an error if postId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, Object.assign(Object.assign({}, reactions_mock_1.removeReactionMock), { postId: '12345' }), auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        removeReaction_1.removeReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if post does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, reactions_mock_1.removeReactionMock, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve(null));
        removeReaction_1.removeReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Post was not found');
        });
    }));
    it('should throw an error if previousReaction is not one of [like, love, happy, wow, sad, angry]', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, reactions_mock_1.reactionMockRequest)({}, Object.assign(Object.assign({}, reactions_mock_1.removeReactionMock), { previousReaction: 'random word' }), auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        removeReaction_1.removeReactions.reactions(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('"previousReaction" must be one of [like, love, happy, wow, sad, angry]');
        });
    }));
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const req = (0, reactions_mock_1.reactionMockRequest)({}, reactions_mock_1.removeReactionMock, auth_mock_1.authUserPayload);
        const res = (0, reactions_mock_1.reactionMockResponse)();
        jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
        jest.spyOn(reaction_cache_1.ReactionsCache.prototype, 'removePostReactionFromCache');
        const spy = jest.spyOn(reaction_queue_1.reactionQueue, 'addReactionJob');
        yield removeReaction_1.removeReactions.reactions(req, res);
        expect(reaction_cache_1.ReactionsCache.prototype.removePostReactionFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268', `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.username}`, (_b = req.body) === null || _b === void 0 ? void 0 : _b.previousReaction);
        expect(reaction_queue_1.reactionQueue.addReactionJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Reaction removed from post successfully.',
        });
    }));
});
//# sourceMappingURL=removeReaction.test.js.map