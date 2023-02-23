"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersSchema = exports.changePasswordSchema = exports.userProfileInfoSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const userProfileInfoSchema = joi_1.default.object().keys({
    quote: joi_1.default.string().optional().allow(null, ''),
    work: joi_1.default.string().optional().allow(null, ''),
    school: joi_1.default.string().optional().allow(null, ''),
    location: joi_1.default.string().optional().allow(null, ''),
    social: {
        facebook: joi_1.default.string().optional().allow(null, ''),
        instagram: joi_1.default.string().optional().allow(null, ''),
        twitter: joi_1.default.string().optional().allow(null, ''),
        youtube: joi_1.default.string().optional().allow(null, ''),
    },
    notifications: {
        messages: joi_1.default.boolean().optional(),
        reactions: joi_1.default.boolean().optional(),
        comments: joi_1.default.boolean().optional(),
        follows: joi_1.default.boolean().optional(),
    },
});
exports.userProfileInfoSchema = userProfileInfoSchema;
const changePasswordSchema = joi_1.default.object().keys({
    currentPassword: joi_1.default.string().required().min(8).max(20).messages({
        'string.base': 'Password should be a type of string',
        'string.min': 'Password must have a minimum length of {#limit}',
        'string.max': 'Password should have a maximum length of {#limit}',
        'string.empty': 'Password is a required field',
    }),
    newPassword: joi_1.default.string().required().min(8).max(20).messages({
        'string.base': 'Password should be a type of string',
        'string.min': 'Password must have a minimum length of {#limit}',
        'string.max': 'Password should have a maximum length of {#limit}',
        'string.empty': 'Password is a required field',
    }),
    confirmPassword: joi_1.default.any().equal(joi_1.default.ref('newPassword')).required().messages({
        'any.only': 'Confirm password does not match new password.',
    }),
});
exports.changePasswordSchema = changePasswordSchema;
const getUsersSchema = joi_1.default.object().keys({
    page: joi_1.default.number().integer().positive().required(),
    pageSize: joi_1.default.number().integer().positive().required(),
});
exports.getUsersSchema = getUsersSchema;
//# sourceMappingURL=userInfo.js.map