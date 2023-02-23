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
const mongoose_1 = require("mongoose");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const reactions_mock_1 = require("../../../../mocks/reactions.mock");
const reaction_service_1 = require("../../../../shared/services/db/reaction.service");
const reaction_cache_1 = require("../../../../shared/services/redis/reaction.cache");
const getReactions_1 = require("../../controllers/getReactions");
const post_mock_1 = require("../../../../mocks/post.mock");
const post_service_1 = require("../../../../shared/services/db/post.service");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');
describe('Get Reactions', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('reactions', () => {
        it('should throw an error if postId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getReactions_1.getReactions.reactions(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if postId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: '12345',
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getReactions_1.getReactions.reactions(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if post does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: `${post_mock_1.postMockData._id}`,
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve(null));
            getReactions_1.getReactions.reactions(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Post was not found');
            });
        }));
        it('should send correct json response if reactions exist in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: `${post_mock_1.postMockData._id}`,
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
            jest.spyOn(reaction_cache_1.ReactionsCache.prototype, 'getReactionsFromCache').mockResolvedValue([reactions_mock_1.reactionData]);
            yield getReactions_1.getReactions.reactions(req, res);
            expect(reaction_cache_1.ReactionsCache.prototype.getReactionsFromCache).toHaveBeenCalledWith(`${post_mock_1.postMockData._id}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post reactions',
                reactions: [reactions_mock_1.reactionData],
            });
        }));
        it('should send correct json response if reactions exist in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: `${post_mock_1.postMockData._id}`,
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
            jest.spyOn(reaction_cache_1.ReactionsCache.prototype, 'getReactionsFromCache').mockResolvedValue([]);
            jest.spyOn(reaction_service_1.reactionService, 'getPostReactions').mockResolvedValue([reactions_mock_1.reactionData]);
            yield getReactions_1.getReactions.reactions(req, res);
            expect(reaction_service_1.reactionService.getPostReactions).toHaveBeenCalledWith({ postId: new mongoose_1.Types.ObjectId(`${post_mock_1.postMockData._id}`) }, { createdAt: -1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post reactions',
                reactions: [reactions_mock_1.reactionData],
            });
        }));
        it('should send correct json response if reactions list is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {}, auth_mock_1.authUserPayload, {
                postId: `${post_mock_1.postMockData._id}`,
            });
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
            jest.spyOn(reaction_cache_1.ReactionsCache.prototype, 'getReactionsFromCache').mockResolvedValue([]);
            jest.spyOn(reaction_service_1.reactionService, 'getPostReactions').mockResolvedValue([]);
            yield getReactions_1.getReactions.reactions(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post reactions',
                reactions: [],
            });
        }));
    });
    describe('singleReactionByUsername', () => {
        it('should send correct json response if reaction exists in cache', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {
                postId: `${post_mock_1.postMockData._id}`,
                username: post_mock_1.postMockData.username,
            }, auth_mock_1.authUserPayload);
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
            jest.spyOn(reaction_cache_1.ReactionsCache.prototype, 'getSingleReactionFromCache').mockResolvedValue(reactions_mock_1.reactionData);
            yield getReactions_1.getReactions.singleReactionByUsername(req, res);
            expect(reaction_cache_1.ReactionsCache.prototype.getSingleReactionFromCache).toHaveBeenCalledWith(`${post_mock_1.postMockData._id}`, post_mock_1.postMockData.username);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single post reaction by username',
                reactions: reactions_mock_1.reactionData,
            });
        }));
        it('should send correct json response if reaction exists in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {
                postId: `${post_mock_1.postMockData._id}`,
                username: post_mock_1.postMockData.username,
            }, auth_mock_1.authUserPayload);
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
            jest.spyOn(reaction_cache_1.ReactionsCache.prototype, 'getSingleReactionFromCache').mockResolvedValue(undefined);
            jest.spyOn(reaction_service_1.reactionService, 'getSinglePostReactionByUsername').mockResolvedValue(reactions_mock_1.reactionData);
            yield getReactions_1.getReactions.singleReactionByUsername(req, res);
            expect(reaction_service_1.reactionService.getSinglePostReactionByUsername).toHaveBeenCalledWith(`${post_mock_1.postMockData._id}`, post_mock_1.postMockData.username);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single post reaction by username',
                reactions: reactions_mock_1.reactionData,
            });
        }));
        it('should send correct json response if reaction is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, {
                postId: `${post_mock_1.postMockData._id}`,
                username: post_mock_1.postMockData.username,
            }, auth_mock_1.authUserPayload);
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
            jest.spyOn(reaction_cache_1.ReactionsCache.prototype, 'getSingleReactionFromCache').mockResolvedValue(undefined);
            jest.spyOn(reaction_service_1.reactionService, 'getSinglePostReactionByUsername').mockResolvedValue(undefined);
            yield getReactions_1.getReactions.singleReactionByUsername(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Single post reaction by username',
                reactions: {},
            });
        }));
    });
    describe('reactionsByUsername', () => {
        it('should throw an error if username is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, { username: '' }, auth_mock_1.authUserPayload);
            const res = (0, reactions_mock_1.reactionMockResponse)();
            getReactions_1.getReactions.reactionsByUsername(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"username" is not allowed to be empty');
            });
        }));
        it('should send correct json response if reactions exist in database', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, { username: post_mock_1.postMockData.username }, auth_mock_1.authUserPayload);
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
            jest.spyOn(reaction_service_1.reactionService, 'getReactionsByUsername').mockResolvedValue([reactions_mock_1.reactionData]);
            yield getReactions_1.getReactions.reactionsByUsername(req, res);
            expect(reaction_service_1.reactionService.getReactionsByUsername).toHaveBeenCalledWith(post_mock_1.postMockData.username);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'All user reactions by username',
                reactions: [reactions_mock_1.reactionData],
            });
        }));
        it('should send correct json response if reactions list is empty', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, reactions_mock_1.reactionMockRequest)({}, { username: post_mock_1.postMockData.username }, auth_mock_1.authUserPayload);
            const res = (0, reactions_mock_1.reactionMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve({}));
            jest.spyOn(reaction_service_1.reactionService, 'getReactionsByUsername').mockResolvedValue([]);
            yield getReactions_1.getReactions.reactionsByUsername(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'All user reactions by username',
                reactions: [],
            });
        }));
    });
});
//# sourceMappingURL=getReactions.test.js.map