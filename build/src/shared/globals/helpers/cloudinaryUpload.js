"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromCloudinary = exports.uploads = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
function uploads(file, publicId, overwrite, invalidate) {
    return new Promise((resolve) => {
        cloudinary_1.default.v2.uploader.upload(file, { public_id: publicId, overwrite, invalidate }, (error, result) => {
            if (error)
                resolve(error);
            resolve(result);
        });
    });
}
exports.uploads = uploads;
function deleteFileFromCloudinary(publicId) {
    return new Promise((resolve) => {
        cloudinary_1.default.v2.uploader.destroy(publicId, (error, result) => {
            if (error)
                resolve(error);
            resolve(result);
        });
    });
}
exports.deleteFileFromCloudinary = deleteFileFromCloudinary;
//# sourceMappingURL=cloudinaryUpload.js.map