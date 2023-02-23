"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
const addImage_1 = require("../controllers/addImage");
const deleteImage_1 = require("../controllers/deleteImage");
const getImages_1 = require("../controllers/getImages");
class ImageRoutes {
    constructor() {
        this.router = express_1.default.Router();
    }
    routes() {
        this.router.get('/images/:userId', authMiddleware_1.authMiddleware.checkAuthentication, getImages_1.getImages.images);
        this.router.post('/images/profile', authMiddleware_1.authMiddleware.checkAuthentication, addImage_1.addImage.profileImage);
        this.router.post('/images/background', authMiddleware_1.authMiddleware.checkAuthentication, addImage_1.addImage.backgroundImage);
        this.router.delete('/images/:imageId', authMiddleware_1.authMiddleware.checkAuthentication, deleteImage_1.deleteImage.image);
        this.router.delete('/images/background/:bgImageId', authMiddleware_1.authMiddleware.checkAuthentication, deleteImage_1.deleteImage.backgroundImage);
        return this.router;
    }
}
exports.imageRoutes = new ImageRoutes();
//# sourceMappingURL=imageRoutes.js.map