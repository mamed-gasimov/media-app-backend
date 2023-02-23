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
const auth_mock_1 = require("../../../../mocks/auth.mock");
const image_mock_1 = require("../../../../mocks/image.mock");
const getImages_1 = require("../../controllers/getImages");
const image_service_1 = require("../../../../shared/services/db/image.service");
jest.useFakeTimers();
describe('Get Images', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });
    it('should throw an error if userId is not available', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, image_mock_1.imagesMockRequest)({}, {}, auth_mock_1.authUserPayload, { userId: '' });
        const res = (0, image_mock_1.imagesMockResponse)();
        getImages_1.getImages.images(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should throw an error if userId is not valid mongodb ObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, image_mock_1.imagesMockRequest)({}, {}, auth_mock_1.authUserPayload, { userId: '12345' });
        const res = (0, image_mock_1.imagesMockResponse)();
        getImages_1.getImages.images(req, res).catch((error) => {
            expect(error.statusCode).toEqual(400);
            expect(error.serializeErrors().message).toEqual('Invalid request.');
        });
    }));
    it('should send correct json response', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = (0, image_mock_1.imagesMockRequest)({}, {}, auth_mock_1.authUserPayload, { userId: '60263f14648fed5246e322d9' });
        const res = (0, image_mock_1.imagesMockResponse)();
        jest.spyOn(image_service_1.imageService, 'getImages').mockResolvedValue([image_mock_1.fileDocumentMock]);
        yield getImages_1.getImages.images(req, res);
        expect(image_service_1.imageService.getImages).toHaveBeenCalledWith(req.params.userId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User images',
            images: [image_mock_1.fileDocumentMock],
        });
    }));
});
//# sourceMappingURL=getImages.test.js.map