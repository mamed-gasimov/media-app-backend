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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.DeleteImage = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_cache_1 = require("../../../shared/services/redis/user.cache");
const image_sockets_1 = require("../../../shared/sockets/image.sockets");
const image_queue_1 = require("../../../shared/services/queues/image.queue");
const image_service_1 = require("../../../shared/services/db/image.service");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const cloudinaryUpload_1 = require("../../../shared/globals/helpers/cloudinaryUpload");
const user_service_1 = require("../../../shared/services/db/user.service");
const userCache = new user_cache_1.UserCache();
class DeleteImage {
    image(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { imageId } = req.params;
            if (!helpers_1.Helpers.checkValidObjectId(imageId)) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const existingImage = yield image_service_1.imageService.getImageId(imageId);
            if (!existingImage) {
                throw new errorHandler_1.BadRequestError('Image was not found.');
            }
            image_sockets_1.socketIOImageObject.emit('delete image', imageId);
            image_queue_1.imageQueue.addImageJob('removeImageFromDb', {
                imageId,
            });
            yield (0, cloudinaryUpload_1.deleteFileFromCloudinary)(existingImage.imgId);
            res.status(http_status_codes_1.default.OK).json({ message: 'Image deleted successfully' });
        });
    }
    backgroundImage(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.params.bgImageId || !((_a = req.params.bgImageId) === null || _a === void 0 ? void 0 : _a.trim())) {
                throw new errorHandler_1.BadRequestError('Invalid request.');
            }
            const image = yield image_service_1.imageService.getImageByBackgroundId(req.params.bgImageId);
            if (!image) {
                throw new errorHandler_1.BadRequestError('Background image was not found.');
            }
            image_sockets_1.socketIOImageObject.emit('delete image', image === null || image === void 0 ? void 0 : image._id);
            const bgImageId = userCache.updateSingleUserItemInCache(`${req.currentUser.userId}`, 'bgImageId', '');
            const bgImageVersion = userCache.updateSingleUserItemInCache(`${req.currentUser.userId}`, 'bgImageVersion', '');
            (yield Promise.all([bgImageId, bgImageVersion]));
            image_queue_1.imageQueue.addImageJob('removeImageFromDb', {
                imageId: image === null || image === void 0 ? void 0 : image._id,
            });
            yield user_service_1.userService.removeBgImg(req.currentUser.userId);
            res.status(http_status_codes_1.default.OK).json({ message: 'Image deleted successfully' });
        });
    }
}
exports.DeleteImage = DeleteImage;
exports.deleteImage = new DeleteImage();
//# sourceMappingURL=deleteImage.js.map