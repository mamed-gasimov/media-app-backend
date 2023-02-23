"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const addCommentSchema = joi_1.default.object().keys({
    postId: joi_1.default.string().required().messages({
        'any.required': 'postId is a required property',
    }),
    comment: joi_1.default.string().required().messages({
        'any.required': 'comment is a required property',
    }),
    profilePicture: joi_1.default.string().optional().allow(null, ''),
});
exports.addCommentSchema = addCommentSchema;
//# sourceMappingURL=comment.js.map