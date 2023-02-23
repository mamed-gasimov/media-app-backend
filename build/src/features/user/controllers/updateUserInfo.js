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
exports.updateUserInfo = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const ip_1 = __importDefault(require("ip"));
const moment_1 = __importDefault(require("moment"));
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const user_cache_1 = require("../../../shared/services/redis/user.cache");
const user_queue_1 = require("../../../shared/services/queues/user.queue");
const auth_service_1 = require("../../../shared/services/db/auth.service");
const user_service_1 = require("../../../shared/services/db/user.service");
const email_queue_1 = require("../../../shared/services/queues/email.queue");
const resetPasswordTemplate_1 = require("../../../shared/services/emails/templates/resetPassword/resetPasswordTemplate");
const userInfo_1 = require("../schemas/userInfo");
const userCache = new user_cache_1.UserCache();
class UpdateUserInfo {
    updateProfileInfo(req, res) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const { social, notifications, quote, work, school, location } = req.body;
            const currentUserId = req.currentUser.userId;
            const user = yield user_service_1.userService.getUserById(currentUserId);
            if (!user) {
                throw new errorHandler_1.BadRequestError('Something went wrong. Please log in again.');
            }
            const basicInfo = {
                quote: quote || user.quote,
                work: work || user.work,
                school: school || user.school,
                location: location || user.location,
            };
            const notificationSettings = {
                messages: (_a = notifications === null || notifications === void 0 ? void 0 : notifications.messages) !== null && _a !== void 0 ? _a : user.notifications.messages,
                reactions: (_b = notifications === null || notifications === void 0 ? void 0 : notifications.reactions) !== null && _b !== void 0 ? _b : user.notifications.reactions,
                comments: (_c = notifications === null || notifications === void 0 ? void 0 : notifications.comments) !== null && _c !== void 0 ? _c : user.notifications.comments,
                follows: (_d = notifications === null || notifications === void 0 ? void 0 : notifications.follows) !== null && _d !== void 0 ? _d : user.notifications.follows,
            };
            const socialLinks = {
                instagram: (social === null || social === void 0 ? void 0 : social.instagram) || user.social.instagram,
                twitter: (social === null || social === void 0 ? void 0 : social.twitter) || user.social.twitter,
                facebook: (social === null || social === void 0 ? void 0 : social.facebook) || user.social.facebook,
                youtube: (social === null || social === void 0 ? void 0 : social.youtube) || user.social.youtube,
            };
            if (work || quote || school || location) {
                for (const [key, value] of Object.entries(basicInfo)) {
                    yield userCache.updateSingleUserItemInCache(`${currentUserId}`, key, `${value}`);
                }
                user_queue_1.userQueue.addUserJob('updateBasicInfoInDb', {
                    key: `${currentUserId}`,
                    value: basicInfo,
                });
            }
            if (social) {
                yield userCache.updateSingleUserItemInCache(`${currentUserId}`, 'social', socialLinks);
                user_queue_1.userQueue.addUserJob('updateSocialLinksInDb', {
                    key: `${currentUserId}`,
                    value: socialLinks,
                });
            }
            if (notifications) {
                yield userCache.updateSingleUserItemInCache(`${currentUserId}`, 'notifications', notificationSettings);
                user_queue_1.userQueue.addUserJob('updateNotificationSettings', {
                    key: `${currentUserId}`,
                    value: notificationSettings,
                });
            }
            res.status(http_status_codes_1.default.OK).json({ message: 'User profile was updated successfully' });
        });
    }
    password(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            if (newPassword !== confirmPassword) {
                throw new errorHandler_1.BadRequestError('Passwords do not match.');
            }
            if (currentPassword === newPassword) {
                throw new errorHandler_1.BadRequestError('Passwords are same');
            }
            const existingUser = (yield auth_service_1.authService.getAuthUserByUsername(req.currentUser.username));
            const passwordsMatch = yield (existingUser === null || existingUser === void 0 ? void 0 : existingUser.comparePassword(currentPassword));
            if (!passwordsMatch) {
                throw new errorHandler_1.BadRequestError('Invalid credentials');
            }
            const hashedPassword = yield (existingUser === null || existingUser === void 0 ? void 0 : existingUser.hashPassword(newPassword));
            user_service_1.userService.updatePassword(`${req.currentUser.username}`, hashedPassword);
            const templateParams = {
                username: existingUser.username,
                email: existingUser.email,
                ipaddress: ip_1.default.address(),
                date: (0, moment_1.default)().format('DD//MM//YYYY HH:mm'),
            };
            const template = resetPasswordTemplate_1.resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
            email_queue_1.emailQueue.addEmailJob('changePassword', {
                template,
                receiverEmail: existingUser.email,
                subject: 'Password update confirmation',
            });
            res.status(http_status_codes_1.default.OK).json({
                message: 'Password updated successfully',
            });
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(userInfo_1.userProfileInfoSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UpdateUserInfo.prototype, "updateProfileInfo", null);
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(userInfo_1.changePasswordSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UpdateUserInfo.prototype, "password", null);
exports.updateUserInfo = new UpdateUserInfo();
//# sourceMappingURL=updateUserInfo.js.map