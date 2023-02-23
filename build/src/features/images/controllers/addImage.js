"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImage = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const cloudinaryUpload_1 = require("../../../shared/globals/helpers/cloudinaryUpload");
const images_1 = require("../schemas/images");
const image_queue_1 = require("../../../shared/services/queues/image.queue");
const user_cache_1 = require("../../../shared/services/redis/user.cache");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const image_sockets_1 = require("../../../shared/sockets/image.sockets");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const config_1 = require("../../../config");
const userCache = new user_cache_1.UserCache();
class AddImage {
    profileImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { image } = req.body;
            if (!helpers_1.Helpers.isDataBase64(image)) {
                throw new errorHandler_1.BadRequestError('Invalid data format.');
            }
            const result = (yield (0, cloudinaryUpload_1.uploads)(image, req.currentUser.userId, true, true));
            if (!(result === null || result === void 0 ? void 0 : result.public_id)) {
                throw new errorHandler_1.BadRequestError('File upload: Error occurred. Try again.');
            }
            const url = `https://res.cloudinary.com/${config_1.config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
            const cachedUser = (yield userCache.updateSingleUserItemInCache(`${req.currentUser.userId}`, 'profilePicture', url));
            image_sockets_1.socketIOImageObject.emit('update user', cachedUser);
            image_queue_1.imageQueue.addImageJob('addUserProfileImageToDb', {
                key: `${req.currentUser.userId}`,
                value: url,
                imgId: result.public_id,
                imgVersion: result.version.toString(),
            });
            res.status(http_status_codes_1.default.OK).json({ message: 'Image added successfully' });
        });
    }
    backgroundImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { version, publicId } = yield AddImage.prototype.backgroundUpload(req.body.image);
            const bgImageId = userCache.updateSingleUserItemInCache(`${req.currentUser.userId}`, 'bgImageId', publicId);
            const bgImageVersion = userCache.updateSingleUserItemInCache(`${req.currentUser.userId}`, 'bgImageVersion', version);
            const response = (yield Promise.all([bgImageId, bgImageVersion]));
            image_sockets_1.socketIOImageObject.emit('update user', {
                bgImageId: publicId,
                bgImageVersion: version,
                userId: response[0],
            });
            image_queue_1.imageQueue.addImageJob('addBGImageToDb', {
                key: `${req.currentUser.userId}`,
                imgId: publicId,
                imgVersion: version.toString(),
            });
            res.status(http_status_codes_1.default.OK).json({ message: 'Image added successfully' });
        });
    }
    backgroundUpload(image) {
        return __awaiter(this, void 0, void 0, function* () {
            const isDataBase64 = helpers_1.Helpers.isDataBase64(image);
            let version = '';
            let publicId = '';
            if (isDataBase64) {
                const result = (yield (0, cloudinaryUpload_1.uploads)(image));
                if (!result.public_id) {
                    throw new errorHandler_1.BadRequestError(result.message);
                }
                else {
                    version = result.version.toString();
                    publicId = result.public_id;
                }
            }
            else {
                const isValidUrl = helpers_1.Helpers.isValidHttpsUrl(image);
                if (isValidUrl) {
                    const value = image.split('/');
                    version = value[value.length - 2];
                    publicId = value[value.length - 1];
                }
                else {
                    throw new errorHandler_1.BadRequestError('Invalid data format.');
                }
            }
            return { version: version === null || version === void 0 ? void 0 : version.replace(/v/g, ''), publicId };
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(images_1.addImageSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AddImage.prototype, "profileImage", null);
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(images_1.addImageSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AddImage.prototype, "backgroundImage", null);
exports.addImage = new AddImage();
//# sourceMappingURL=addImage.js.map