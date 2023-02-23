"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const socket_io_1 = require("socket.io");
const cloudinaryUploads = __importStar(require("../../../../shared/globals/helpers/cloudinaryUpload"));
const updatePost_1 = require("../../controllers/updatePost");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const post_mock_1 = require("../../../../mocks/post.mock");
const post_service_1 = require("../../../../shared/services/db/post.service");
const post_queue_1 = require("../../../../shared/services/queues/post.queue");
const post_cache_1 = require("../../../../shared/services/redis/post.cache");
const postServer = __importStar(require("../../../../shared/sockets/post.sockets"));
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');
jest.mock('@global/helpers/cloudinaryUpload');
Object.defineProperties(postServer, {
    socketIOPostObject: {
        value: new socket_io_1.Server(),
        writable: true,
    },
});
describe('Update Post', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('post without image', () => {
        it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.updatedPost, auth_mock_1.authUserPayload, { postId: `${post_mock_1.postMockData._id}` });
            const res = (0, post_mock_1.postMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve(post_mock_1.postMockData));
            const postSpy = jest.spyOn(post_cache_1.PostCache.prototype, 'updatePostInCache').mockResolvedValue(post_mock_1.postMockData);
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            jest.spyOn(post_queue_1.postQueue, 'addPostJob');
            yield updatePost_1.updatePost.post(req, res);
            expect(postSpy).toHaveBeenCalledWith(`${post_mock_1.postMockData._id}`, post_mock_1.updatedPost);
            expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('update post', post_mock_1.postMockData, 'posts');
            expect(post_queue_1.postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDb', {
                key: `${post_mock_1.postMockData._id}`,
                value: post_mock_1.postMockData,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post updated successfully',
            });
        }));
        it('should throw an error if postId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.updatedPost, auth_mock_1.authUserPayload, { postId: '' });
            const res = (0, post_mock_1.postMockResponse)();
            updatePost_1.updatePost.post(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if postId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.updatedPost, auth_mock_1.authUserPayload, { postId: '12345' });
            const res = (0, post_mock_1.postMockResponse)();
            updatePost_1.updatePost.post(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid request.');
            });
        }));
        it('should throw an error if post does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.updatedPost, auth_mock_1.authUserPayload, { postId: '551137c2f9e1fac808a5f572' });
            const res = (0, post_mock_1.postMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve(null));
            updatePost_1.updatePost.post(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Post was not found');
            });
        }));
    });
    describe('post with image', () => {
        it('should throw an upload error if image is not valid', () => {
            post_mock_1.updatedPostWithImage.image = 'some invalid string';
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.updatedPostWithImage, auth_mock_1.authUserPayload, { postId: `${post_mock_1.postMockData._id}` });
            const res = (0, post_mock_1.postMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve(post_mock_1.postMockData));
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '', public_id: '', message: 'Upload error' }));
            updatePost_1.updatePost.post(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Upload error');
            });
        });
        it('should send correct json response if post had image before', () => __awaiter(void 0, void 0, void 0, function* () {
            post_mock_1.postMockData.imgId = '1234';
            post_mock_1.postMockData.imgVersion = '1234';
            post_mock_1.updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.updatedPostWithImage, auth_mock_1.authUserPayload, { postId: `${post_mock_1.postMockData._id}` });
            const res = (0, post_mock_1.postMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve(post_mock_1.postMockData));
            const postSpy = jest.spyOn(post_cache_1.PostCache.prototype, 'updatePostInCache');
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            jest.spyOn(post_queue_1.postQueue, 'addPostJob');
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '1234', public_id: '123456' }));
            yield updatePost_1.updatePost.post(req, res);
            expect(post_cache_1.PostCache.prototype.updatePostInCache).toHaveBeenCalledWith(`${post_mock_1.postMockData._id}`, postSpy.mock.calls[0][1]);
            expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('update post', post_mock_1.postMockData, 'posts');
            expect(post_queue_1.postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDb', {
                key: `${post_mock_1.postMockData._id}`,
                value: post_mock_1.postMockData,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post updated successfully',
            });
        }));
        it('should send correct json response if post did not have image before', () => __awaiter(void 0, void 0, void 0, function* () {
            post_mock_1.postMockData.imgId = '';
            post_mock_1.postMockData.imgVersion = '';
            post_mock_1.updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
            const req = (0, post_mock_1.postMockRequest)(post_mock_1.updatedPostWithImage, auth_mock_1.authUserPayload, { postId: `${post_mock_1.postMockData._id}` });
            const res = (0, post_mock_1.postMockResponse)();
            jest.spyOn(post_service_1.postService, 'findPostById').mockImplementation(() => Promise.resolve(post_mock_1.postMockData));
            const postSpy = jest.spyOn(post_cache_1.PostCache.prototype, 'updatePostInCache');
            jest.spyOn(postServer.socketIOPostObject, 'emit');
            jest.spyOn(post_queue_1.postQueue, 'addPostJob');
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '1234', public_id: '123456' }));
            yield updatePost_1.updatePost.post(req, res);
            expect(post_cache_1.PostCache.prototype.updatePostInCache).toHaveBeenCalledWith(`${post_mock_1.postMockData._id}`, postSpy.mock.calls[0][1]);
            expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('update post', post_mock_1.postMockData, 'posts');
            expect(post_queue_1.postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDb', {
                key: `${post_mock_1.postMockData._id}`,
                value: post_mock_1.postMockData,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post updated successfully',
            });
        }));
    });
});
//# sourceMappingURL=updatePost.test.js.map