"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const loginSchema = joi_1.default.object().keys({
    username: joi_1.default.string().required().min(4).max(20).messages({
        'string.base': 'Username must be of type string',
        'string.min': 'Invalid username',
        'string.max': 'Invalid username',
        'string.empty': 'Username is a required field',
    }),
    password: joi_1.default.string().required().min(8).max(20).messages({
        'string.base': 'Password must be of type string',
        'string.min': 'Invalid password',
        'string.max': 'Invalid password',
        'string.empty': 'Password is a required field',
    }),
});
exports.loginSchema = loginSchema;
//# sourceMappingURL=signin.js.map