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
exports.imageWorker = void 0;
const config_1 = require("../../config");
const image_service_1 = require("../services/db/image.service");
const log = config_1.config.createLogger('imageWorker');
class ImageWorker {
    addUserProfileImageToDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key, value, imgId, imgVersion } = job.data;
                yield image_service_1.imageService.addUserProfileImageToDb(key, value, imgId, imgVersion);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    addBGImageToDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key, imgId, imgVersion } = job.data;
                yield image_service_1.imageService.addBackgroundImageToDb(key, imgId, imgVersion);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    addImageToDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key, imgId, imgVersion } = job.data;
                yield image_service_1.imageService.addImage(key, imgId, imgVersion, 'post');
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    removeImageFromDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { imageId } = job.data;
                yield image_service_1.imageService.removeImageFromDb(imageId);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
}
exports.imageWorker = new ImageWorker();
//# sourceMappingURL=image.worker.js.map