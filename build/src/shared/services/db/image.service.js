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
exports.imageService = void 0;
const mongoose_1 = require("mongoose");
const image_model_1 = require("../../../features/images/models/image.model");
const user_model_1 = require("../../../features/user/models/user.model");
class ImageService {
    addUserProfileImageToDb(userId, url, imgId, imgVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user_model_1.UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
            yield this.addImage(userId, imgId, imgVersion, 'profile');
        });
    }
    addBackgroundImageToDb(userId, imgId, imgVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user_model_1.UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }).exec();
            yield this.addImage(userId, imgId, imgVersion, 'background');
        });
    }
    addImage(userId, imgId, imgVersion, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageInDb = yield image_model_1.ImageModel.findOne({
                imgId: type === 'profile' || type === 'post' ? imgId : '',
                imgVersion: type === 'profile' || type === 'post' ? imgVersion : '',
                bgImageVersion: type === 'background' ? imgVersion : '',
                bgImageId: type === 'background' ? imgId : '',
            });
            if (!imageInDb) {
                yield image_model_1.ImageModel.create({
                    userId,
                    bgImageVersion: type === 'background' ? imgVersion : '',
                    bgImageId: type === 'background' ? imgId : '',
                    imgVersion: type === 'profile' || type === 'post' ? imgVersion : '',
                    imgId: type === 'profile' || type === 'post' ? imgId : '',
                });
            }
        });
    }
    removeImageFromDb(imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield image_model_1.ImageModel.deleteOne({ _id: imageId }).exec();
        });
    }
    getImageId(imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield image_model_1.ImageModel.findOne({ _id: imageId }).exec();
            return image;
        });
    }
    getImageByBackgroundId(bgImageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield image_model_1.ImageModel.findOne({ bgImageId }).exec();
            return image;
        });
    }
    getImages(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const images = yield image_model_1.ImageModel.aggregate([
                { $match: { userId: new mongoose_1.Types.ObjectId(userId) } },
            ]);
            return images;
        });
    }
}
exports.imageService = new ImageService();
//# sourceMappingURL=image.service.js.map