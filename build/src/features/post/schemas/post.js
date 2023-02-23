"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const postSchema = joi_1.default.object().keys({
    post: joi_1.default.string().optional().allow(null, ''),
    bgColor: joi_1.default.string().optional().allow(null, ''),
    privacy: joi_1.default.string().optional().allow(null, ''),
    feelings: joi_1.default.string().optional().allow(null, ''),
    gifUrl: joi_1.default.string().optional().allow(null, ''),
    profilePicture: joi_1.default.string().optional().allow(null, ''),
    imgVersion: joi_1.default.string().optional().allow(null, ''),
    imgId: joi_1.default.string().optional().allow(null, ''),
    image: joi_1.default.string().optional().allow(null, ''),
});
exports.postSchema = postSchema;
//# sourceMappingURL=post.js.map