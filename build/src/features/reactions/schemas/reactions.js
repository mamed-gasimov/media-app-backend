"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionsByUsernameSchema = exports.singleReactionByUsernameSchema = exports.removeReactionSchema = exports.addReactionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const addReactionSchema = joi_1.default.object().keys({
    postId: joi_1.default.string().required().messages({
        'any.required': 'postId is a required property',
    }),
    type: joi_1.default.string().required().valid('like', 'love', 'happy', 'wow', 'sad', 'angry').messages({
        'any.required': 'Reaction type is a required property',
    }),
    profilePicture: joi_1.default.string().optional().allow(null, ''),
    previousReaction: joi_1.default.string()
        .valid('like', 'love', 'happy', 'wow', 'sad', 'angry')
        .optional()
        .allow(null, ''),
});
exports.addReactionSchema = addReactionSchema;
const removeReactionSchema = joi_1.default.object().keys({
    postId: joi_1.default.string().required().messages({
        'any.required': 'postId is a required property',
    }),
    previousReaction: joi_1.default.string().required().valid('like', 'love', 'happy', 'wow', 'sad', 'angry').messages({
        'any.required': 'previousReaction is a required property',
    }),
});
exports.removeReactionSchema = removeReactionSchema;
const singleReactionByUsernameSchema = joi_1.default.object().keys({
    postId: joi_1.default.string().required().messages({
        'any.required': 'postId is a required property',
    }),
    username: joi_1.default.string().required().messages({
        'any.required': 'Username is a required property',
    }),
});
exports.singleReactionByUsernameSchema = singleReactionByUsernameSchema;
const reactionsByUsernameSchema = joi_1.default.object().keys({
    username: joi_1.default.string().required().messages({
        'any.required': 'Username is a required property',
    }),
});
exports.reactionsByUsernameSchema = reactionsByUsernameSchema;
//# sourceMappingURL=reactions.js.map