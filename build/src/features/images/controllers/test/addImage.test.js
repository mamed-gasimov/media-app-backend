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
const imageServer = __importStar(require("../../../../shared/sockets/image.sockets"));
const image_mock_1 = require("../../../../mocks/image.mock");
const addImage_1 = require("../../controllers/addImage");
const auth_mock_1 = require("../../../../mocks/auth.mock");
const user_cache_1 = require("../../../../shared/services/redis/user.cache");
const user_mock_1 = require("../../../../mocks/user.mock");
const image_queue_1 = require("../../../../shared/services/queues/image.queue");
const cloudinaryUploads = __importStar(require("../../../../shared/globals/helpers/cloudinaryUpload"));
const config_1 = require("../../../../config");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@socket/user.sockets');
jest.mock('@global/helpers/cloudinaryUpload');
Object.defineProperties(imageServer, {
    socketIOImageObject: {
        value: new socket_io_1.Server(),
        writable: true,
    },
});
const imageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBw';
const url = `https://res.cloudinary.com/${config_1.config.CLOUD_NAME}/image/upload/v1234/123456`;
describe('Add Image', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    describe('profileImage', () => {
        it('should throw an error if image is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, image_mock_1.imagesMockRequest)({}, {}, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            addImage_1.addImage.profileImage(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"image" is required');
            });
        }));
        it('should throw an error if image is not base64 format', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: '12345' }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            addImage_1.addImage.profileImage(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid data format.');
            });
        }));
        it('should call image upload method', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: imageBase64 }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '1234', public_id: '123456' }));
            yield addImage_1.addImage.profileImage(req, res);
            expect(cloudinaryUploads.uploads).toHaveBeenCalledWith(req.body.image, (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId, true, true);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image added successfully',
            });
        }));
        it('should call updateSingleUserItemInCache method', () => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: imageBase64 }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'updateSingleUserItemInCache').mockResolvedValue(user_mock_1.existingUser);
            jest.spyOn(imageServer.socketIOImageObject, 'emit');
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '1234', public_id: '123456' }));
            yield addImage_1.addImage.profileImage(req, res);
            expect(user_cache_1.UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.userId}`, 'profilePicture', url);
            expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('update user', user_mock_1.existingUser);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image added successfully',
            });
        }));
        it('should call addImageJob method', () => __awaiter(void 0, void 0, void 0, function* () {
            var _c;
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: imageBase64 }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '1234', public_id: '123456' }));
            jest.spyOn(image_queue_1.imageQueue, 'addImageJob');
            yield addImage_1.addImage.profileImage(req, res);
            expect(image_queue_1.imageQueue.addImageJob).toHaveBeenCalledWith('addUserProfileImageToDb', {
                key: `${(_c = req.currentUser) === null || _c === void 0 ? void 0 : _c.userId}`,
                value: url,
                imgId: '123456',
                imgVersion: '1234',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image added successfully',
            });
        }));
    });
    describe('backgroundImage', () => {
        it('should throw an error if image is not available', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: '' }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            addImage_1.addImage.profileImage(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('"image" is not allowed to be empty');
            });
        }));
        it('should throw an error if image is neither url nor base64 format', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: '12345' }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            addImage_1.addImage.profileImage(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Invalid data format.');
            });
        }));
        it('should upload new image', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '2467', public_id: '987654' }));
            yield addImage_1.addImage.backgroundImage(req, res);
            expect(cloudinaryUploads.uploads).toHaveBeenCalledWith(req.body.image);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image added successfully',
            });
        }));
        it('should not upload existing image', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: 'https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456' }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            jest.spyOn(cloudinaryUploads, 'uploads');
            yield addImage_1.addImage.backgroundImage(req, res);
            expect(cloudinaryUploads.uploads).not.toHaveBeenCalledWith(req.body.image);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image added successfully',
            });
        }));
        it('should return bad request error', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '', public_id: '', message: 'Upload error' }));
            addImage_1.addImage.backgroundImage(req, res).catch((error) => {
                expect(error.statusCode).toEqual(400);
                expect(error.serializeErrors().message).toEqual('Upload error');
            });
        }));
        it('should call updateSingleUserItemInCache method', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            jest.spyOn(user_cache_1.UserCache.prototype, 'updateSingleUserItemInCache').mockResolvedValue(user_mock_1.existingUser);
            jest.spyOn(imageServer.socketIOImageObject, 'emit');
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '1234', public_id: '123456' }));
            yield addImage_1.addImage.backgroundImage(req, res);
            expect(user_cache_1.UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser.userId}`, 'bgImageId', '123456');
            expect(user_cache_1.UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser.userId}`, 'bgImageVersion', '1234');
            expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('update user', {
                bgImageId: '123456',
                bgImageVersion: '1234',
                userId: user_mock_1.existingUser,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image added successfully',
            });
        }));
        it('should call addImageJob method', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const req = (0, image_mock_1.imagesMockRequest)({}, { image: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }, auth_mock_1.authUserPayload);
            const res = (0, image_mock_1.imagesMockResponse)();
            jest
                .spyOn(cloudinaryUploads, 'uploads')
                .mockImplementation(() => Promise.resolve({ version: '1234', public_id: '123456' }));
            jest.spyOn(image_queue_1.imageQueue, 'addImageJob');
            yield addImage_1.addImage.backgroundImage(req, res);
            expect(image_queue_1.imageQueue.addImageJob).toHaveBeenCalledWith('addBGImageToDb', {
                key: `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`,
                imgId: '123456',
                imgVersion: '1234',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Image added successfully',
            });
        }));
    });
});
//# sourceMappingURL=addImage.test.js.map