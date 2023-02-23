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
exports.signUp = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const signup_1 = require("../schemas/signup");
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const cloudinaryUpload_1 = require("../../../shared/globals/helpers/cloudinaryUpload");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const helpers_1 = require("../../../shared/globals/helpers/helpers");
const config_1 = require("../../../config");
const auth_service_1 = require("../../../shared/services/db/auth.service");
const auth_queue_1 = require("../../../shared/services/queues/auth.queue");
const user_queue_1 = require("../../../shared/services/queues/user.queue");
const user_cache_1 = require("../../../shared/services/redis/user.cache");
const userCache = new user_cache_1.UserCache();
class SignUp {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password, avatarColor, avatarImage } = req.body;
            const checkUserExist = yield auth_service_1.authService.getUserByUsernameOrEmail(username, email);
            if (checkUserExist) {
                throw new errorHandler_1.BadRequestError('User is already exists!');
            }
            const authObjectId = new mongodb_1.ObjectId();
            const userObjectId = new mongodb_1.ObjectId();
            const uId = helpers_1.Helpers.generateRandomIntegers(12).toString();
            const authData = SignUp.prototype.signUpData({
                _id: authObjectId,
                username,
                email,
                password,
                uId,
                avatarColor,
            });
            const result = yield (0, cloudinaryUpload_1.uploads)(avatarImage, `${userObjectId}`, true, true);
            if (!(result === null || result === void 0 ? void 0 : result.public_id)) {
                throw new errorHandler_1.BadRequestError('File upload: Error occured! Try again.');
            }
            // Add to redis cache
            const userDataForCache = SignUp.prototype.userData(authData, userObjectId);
            userDataForCache.profilePicture = `https://res.cloudinary.com/${config_1.config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
            yield userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);
            // Add to database
            auth_queue_1.authQueue.addAuthUserJob('addAuthUserToDb', { value: authData });
            user_queue_1.userQueue.addUserJob('addUserToDb', { value: userDataForCache });
            const userJWT = SignUp.prototype.signToken(authData, userObjectId);
            req.session = { jwt: userJWT };
            res.status(http_status_codes_1.default.CREATED).json({
                message: 'User is created successfully!',
                user: userDataForCache,
                token: userJWT,
            });
        });
    }
    signToken(data, userObjectId) {
        return jsonwebtoken_1.default.sign({
            userId: userObjectId,
            uId: data.uId,
            email: data.email,
            username: data.username,
            avatarColor: data.avatarColor,
        }, config_1.config.JWT_TOKEN);
    }
    signUpData(data) {
        const { _id, username, email, password, uId, avatarColor } = data;
        return {
            _id,
            username: helpers_1.Helpers.firstLetterUpperCase(username),
            email: helpers_1.Helpers.lowerCase(email),
            password,
            avatarColor,
            uId,
            createdAt: new Date(),
        };
    }
    userData(data, userObjectId) {
        const { _id, username, email, uId, avatarColor } = data;
        return {
            _id: userObjectId,
            authId: _id,
            uId,
            username: helpers_1.Helpers.firstLetterUpperCase(username),
            email,
            avatarColor,
            profilePicture: '',
            blocked: [],
            blockedBy: [],
            work: '',
            location: '',
            school: '',
            quote: '',
            bgImageVersion: '',
            bgImageId: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            notifications: {
                messages: true,
                reactions: true,
                comments: true,
                follows: true,
            },
            social: {
                facebook: '',
                instagram: '',
                twitter: '',
                youtube: '',
            },
        };
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(signup_1.signupSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SignUp.prototype, "create", null);
exports.signUp = new SignUp();
//# sourceMappingURL=signup.js.map