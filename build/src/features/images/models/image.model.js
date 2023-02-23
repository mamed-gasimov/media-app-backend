"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageModel = void 0;
const mongoose_1 = require("mongoose");
const imageSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    bgImageVersion: { type: String, default: '' },
    bgImageId: { type: String, default: '' },
    imgVersion: { type: String, default: '' },
    imgId: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now, index: true },
});
const ImageModel = (0, mongoose_1.model)('Image', imageSchema, 'Image');
exports.ImageModel = ImageModel;
//# sourceMappingURL=image.model.js.map