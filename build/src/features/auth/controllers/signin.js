"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signIn = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signin_1 = require("../schemas/signin");
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const config_1 = require("../../../config");
const auth_service_1 = require("../../../shared/services/db/auth.service");
const user_service_1 = require("../../../shared/services/db/user.service");
class SignIn {
    read(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt) {
                throw new errorHandler_1.BadRequestError('You need to sign out first.');
            }
            const existingUser = yield auth_service_1.authService.getAuthUserByUsername(username);
            if (!existingUser) {
                throw new errorHandler_1.BadRequestError('Invalid credentials!');
            }
            const passwordMatch = yield existingUser.comparePassword(password);
            if (!passwordMatch) {
                throw new errorHandler_1.BadRequestError('Invalid credentials!');
            }
            const user = yield user_service_1.userService.getUserByAuthId(`${existingUser._id}`);
            const userJWT = jsonwebtoken_1.default.sign({
                userId: user._id,
                uId: existingUser.uId,
                email: existingUser.email,
                username: existingUser.username,
                avatarColor: existingUser.avatarColor,
            }, config_1.config.JWT_TOKEN);
            req.session = { jwt: userJWT };
            const userDocument = Object.assign(Object.assign({}, user), { authId: existingUser._id, username: existingUser.username, email: existingUser.email, avatarColor: existingUser.avatarColor, uId: existingUser.uId, createdAt: existingUser.createdAt });
            res.status(http_status_codes_1.default.OK).json({
                message: 'User logged in successfully!',
                user: userDocument,
                token: userJWT,
            });
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(signin_1.loginSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SignIn.prototype, "read", null);
exports.signIn = new SignIn();
//# sourceMappingURL=signin.js.map