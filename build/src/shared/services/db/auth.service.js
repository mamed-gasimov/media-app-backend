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
exports.authService = void 0;
const auth_model_1 = require("../../../features/auth/models/auth.model");
const helpers_1 = require("../../globals/helpers/helpers");
class AuthService {
    createAuthUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield auth_model_1.AuthModel.create(data);
        });
    }
    updatePasswordToken(authId, token, tokenExpiration) {
        return __awaiter(this, void 0, void 0, function* () {
            yield auth_model_1.AuthModel.updateOne({ _id: authId }, { passwordResetToken: token, passwordResetExpires: tokenExpiration });
        });
    }
    getUserByUsernameOrEmail(username, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                $or: [{ username: helpers_1.Helpers.firstLetterUpperCase(username) }, { email: helpers_1.Helpers.lowerCase(email) }],
            };
            const user = yield auth_model_1.AuthModel.findOne(query).exec();
            return user;
        });
    }
    getAuthUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield auth_model_1.AuthModel.findOne({
                username: helpers_1.Helpers.firstLetterUpperCase(username),
            }).exec();
            return user;
        });
    }
    getAuthUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield auth_model_1.AuthModel.findOne({
                email: helpers_1.Helpers.lowerCase(email),
            }).exec();
            return user;
        });
    }
    getAuthUserByPasswordToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield auth_model_1.AuthModel.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() },
            }).exec();
            return user;
        });
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map