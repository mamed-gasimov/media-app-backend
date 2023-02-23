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
exports.createPost = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongodb_1 = require("mongodb");
const joiValidation_decorator_1 = require("../../../shared/globals/decorators/joiValidation.decorator");
const cloudinaryUpload_1 = require("../../../shared/globals/helpers/cloudinaryUpload");
const errorHandler_1 = require("../../../shared/globals/helpers/errorHandler");
const post_1 = require("../schemas/post");
const post_queue_1 = require("../../../shared/services/queues/post.queue");
const post_cache_1 = require("../../../shared/services/redis/post.cache");
const post_sockets_1 = require("../../../shared/sockets/post.sockets");
const image_queue_1 = require("../../../shared/services/queues/image.queue");
const postCache = new post_cache_1.PostCache();
class CreatePost {
    post(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;
            let result;
            if (image) {
                result = yield (0, cloudinaryUpload_1.uploads)(image);
                if (!(result === null || result === void 0 ? void 0 : result.public_id)) {
                    throw new errorHandler_1.BadRequestError(result === null || result === void 0 ? void 0 : result.message);
                }
            }
            const postObjectId = new mongodb_1.ObjectId();
            const createdPost = {
                _id: postObjectId,
                userId: req.currentUser.userId,
                username: req.currentUser.username,
                email: req.currentUser.email,
                avatarColor: req.currentUser.avatarColor,
                post,
                bgColor,
                privacy,
                gifUrl,
                profilePicture,
                feelings,
                commentsCount: 0,
                imgVersion: `${(result === null || result === void 0 ? void 0 : result.version) || ''}`,
                imgId: `${(result === null || result === void 0 ? void 0 : result.public_id) || ''}`,
                videoId: '',
                videoVersion: '',
                createdAt: new Date(),
                updatedAt: null,
                reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 },
            };
            post_sockets_1.socketIOPostObject.emit('add post', createdPost);
            yield postCache.savePostToCache({
                key: postObjectId,
                currentUserId: `${(_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.userId}`,
                uId: `${(_b = req.currentUser) === null || _b === void 0 ? void 0 : _b.uId}`,
                createdPost,
            });
            post_queue_1.postQueue.addPostJob('addPostToDb', { key: req.currentUser.userId, value: createdPost });
            if ((result === null || result === void 0 ? void 0 : result.version) && (result === null || result === void 0 ? void 0 : result.public_id)) {
                image_queue_1.imageQueue.addImageJob('addImageToDb', {
                    key: `${req.currentUser.userId}`,
                    imgId: result.public_id,
                    imgVersion: result.version.toString(),
                });
            }
            res.status(http_status_codes_1.default.CREATED).json({ message: 'Post created successfully' });
        });
    }
}
__decorate([
    (0, joiValidation_decorator_1.joiValidation)(post_1.postSchema),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CreatePost.prototype, "post", null);
exports.createPost = new CreatePost();
//# sourceMappingURL=createPost.js.map