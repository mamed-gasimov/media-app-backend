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
const auth_mock_1 = require("../../../../mocks/auth.mock");
const imageServer = __importStar(require("../../../../shared/sockets/image.sockets"));
const image_mock_1 = require("../../../../mocks/image.mock");
const image_queue_1 = require("../../../../shared/services/queues/image.queue");
const deleteImage_1 = require("../../controllers/deleteImage");
const image_service_1 = require("../../../../shared/services/db/image.service");
const user_cache_1 = require("../../../../shared/services/redis/user.cache");
const cloudinaryUploads = __importStar(require("../../../../shared/globals/helpers/cloudinaryUpload"));
const user_service_1 = require("../../../../shared/services/db/user.service");
const user_mock_1 = require("../../../../mocks/user.mock");
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
Object.defineProperties(imageServer, {
    socketIOImageObject: {
        value: new socket_io_1.Server(),
        writable: true,
    },
});
describe('Delete Image', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if imageId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, image_mock_1.imagesMockRequest)({}, {}, auth_mock_1.authUserPayload, { imageId: '' });
        const res = (0, image_mock_1.imagesMockResponse)();
        deleteImage_1.deleteImage.image(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if imageId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, image_mock_1.imagesMockRequest)({}, {}, auth_mock_1.authUserPayload, { imageId: '12345' });
        const res = (0, image_mock_1.imagesMockResponse)();
        deleteImage_1.deleteImage.image(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if image does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, image_mock_1.imagesMockRequest)({}, {}, auth_mock_1.authUserPayload, { imageId: '60263f14648fed5246e322d9' });
        const res = (0, image_mock_1.imagesMockResponse)();
        jest.spyOn(image_service_1.imageService, 'getImageId').mockResolvedValue(null);
        deleteImage_1.deleteImage.image(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Image was not found.');
        });
    }));
    it('should send correct json response for image removal', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, image_mock_1.imagesMockRequest)({}, {}, auth_mock_1.authUserPayload, { imageId: '60263f14648fed5246e322d9' });
        const res = (0, image_mock_1.imagesMockResponse)();
        jest.spyOn(image_service_1.imageService, 'getImageId').mockResolvedValue(image_mock_1.fileDocumentMock);
        jest.spyOn(imageServer.socketIOImageObject, 'emit');
        jest.spyOn(image_queue_1.imageQueue, 'addImageJob');
        jest
            .spyOn(cloudinaryUploads, 'deleteFileFromCloudinary')
            .mockImplementation(() => Promise.resolve({ version: '1234', public_id: '123456' }));
        yield deleteImage_1.deleteImage.image(req, res);
        expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('delete image', req.params.imageId);
        expect(image_queue_1.imageQueue.addImageJob).toHaveBeenCalledWith('removeImageFromDb', { imageId: req.params.imageId });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Image deleted successfully',
        });
    }));
    it('should send correct json response for background image removal', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const req = (0, image_mock_1.imagesMockRequest)({}, {}, auth_mock_1.authUserPayload, { bgImageId: '60263f' });
        const res = (0, image_mock_1.imagesMockResponse)();
        jest.spyOn(imageServer.socketIOImageObject, 'emit');
        jest.spyOn(image_queue_1.imageQueue, 'addImageJob');
        jest.spyOn(image_service_1.imageService, 'getImageByBackgroundId').mockResolvedValue(image_mock_1.fileDocumentMock);
        jest.spyOn(user_cache_1.UserCache.prototype, 'updateSingleUserItemInCache');
        jest.spyOn(user_service_1.userService, 'removeBgImg').mockResolvedValue(user_mock_1.existingUser);
        yield deleteImage_1.deleteImage.backgroundImage(req, res);
        expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('delete image', image_mock_1.fileDocumentMock._id);
        expect(image_queue_1.imageQueue.addImageJob).toHaveBeenCalledWith('removeImageFromDb', {
            imageId: image_mock_1.fileDocumentMock._id,
        });
        expect(user_cache_1.UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`, 'bgImageId', '');
        expect(user_cache_1.UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.userId}`, 'bgImageVersion', '');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Image deleted successfully',
        });
    }));
});
//# sourceMappingURL=deleteImage.test.js.map