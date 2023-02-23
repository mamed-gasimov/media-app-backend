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
exports.passwordReset = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const ip_1 = __importDefault(require("ip"));
const moment_1 = __importDefault(require("moment"));
const password_1 = require("../schemas/password");
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const config_1 = require("../../../config");
const auth_service_1 = require("../../../shared/services/db/auth.service");
const forgotPasswordTemplate_1 = require("../../../shared/services/emails/templates/forgotPassword/forgotPasswordTemplate");
const resetPasswordTemplate_1 = require("../../../shared/services/emails/templates/resetPassword/resetPasswordTemplate");
const email_queue_1 = require("../../../shared/services/queues/email.queue");
class PasswordReset {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const existingUser = yield auth_service_1.authService.getAuthUserByEmail(email);
            if (!existingUser) {
                throw new errorHandler_1.BadRequestError('Invalid credentials');
            }
            const randomCharacters = helpers_1.Helpers.generateRandomCharacters(20);
            yield auth_service_1.authService.updatePasswordToken(`${existingUser._id}`, randomCharacters, Date.now() * 5 * 60 * 1000);
            const resetLink = `${config_1.config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
            const template = forgotPasswordTemplate_1.forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);
            email_queue_1.emailQueue.addEmailJob('forgotPasswordEmail', {
                template,
                receiverEmail: email,
                subject: 'Reset your password',
            });
            res.status(http_status_codes_1.default.OK).json({ message: 'Reset password email is sent.' });
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { password } = req.body;
            const { token } = req.params;
            if (!token) {
                throw new errorHandler_1.BadRequestError('Reset token is required!');
            }
            const existingUser = yield auth_service_1.authService.getAuthUserByPasswordToken(token);
            if (!existingUser) {
                throw new errorHandler_1.BadRequestError('Reset token has expired.');
            }
            existingUser.password = password;
            existingUser.passwordResetToken = undefined;
            existingUser.passwordResetExpires = undefined;
            // password will be hashed due to pre save hook in models
            yield existingUser.save();
            const templateParams = {
                username: existingUser.username,
                email: existingUser.email,
                ipaddress: ip_1.default.address(),
                date: (0, moment_1.default)().format('DD//MM//YYYY HH:mm'),
            };
            const template = resetPasswordTemplate_1.resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
            email_queue_1.emailQueue.addEmailJob('forgotPasswordEmail', {
                template,
                receiverEmail: existingUser.email,
                subject: 'Password Reset Confirmation',
            });
            res.status(http_status_codes_1.default.OK).json({ message: 'Password successfully updated.' });
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(password_1.emailSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PasswordReset.prototype, "create", null);
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(password_1.passwordSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PasswordReset.prototype, "update", null);
exports.passwordReset = new PasswordReset();
//# sourceMappingURL=passwordReset.js.map