"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../helpers/errorHandler");
const config_1 = require("../../../config");
class AuthMiddleware {
    verifyUser(req, _res, next) {
        var _a, _b;
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt)) {
            throw new errorHandler_1.NotAuthorizedError('Token is not available. Please log in again.');
        }
        try {
            const payload = jsonwebtoken_1.default.verify((_b = req.session) === null || _b === void 0 ? void 0 : _b.jwt, config_1.config.JWT_TOKEN);
            req.currentUser = payload;
        }
        catch (error) {
            throw new errorHandler_1.NotAuthorizedError('Token is not valid. Please log in again.');
        }
        next();
    }
    checkAuthentication(req, _res, next) {
        if (!req.currentUser) {
            throw new errorHandler_1.NotAuthorizedError('Not authenticated.');
        }
        next();
    }
}
exports.authMiddleware = new AuthMiddleware();
//# sourceMappingURL=authMiddleware.js.map