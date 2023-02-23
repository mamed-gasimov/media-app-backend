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
exports.PostCache = void 0;
const errorHandler_1 = require("../../globals/helpers/errorHandler");
const helpers_1 = require("../../globals/helpers/helpers");
const config_1 = require("../../../config");
const base_cache_1 = require("../redis/base.cache");
const log = config_1.config.createLogger('postCache');
class PostCache extends base_cache_1.BaseCache {
    constructor() {
        super('postCache');
    }
    savePostToCache(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { createdPost, currentUserId, key, uId } = data;
            const { _id, userId, username, email, avatarColor, profilePicture, post, bgColor, feelings, privacy, gifUrl, commentsCount, imgVersion, imgId, videoId, videoVersion, reactions, createdAt, } = createdPost;
            const firstList = [
                '_id',
                `${_id}`,
                'userId',
                `${userId}`,
                'username',
                `${username}`,
                'email',
                `${email}`,
                'avatarColor',
                `${avatarColor}`,
                'profilePicture',
                `${profilePicture}`,
                'post',
                `${post}`,
                'bgColor',
                `${bgColor}`,
                'feelings',
                `${feelings}`,
                'privacy',
                `${privacy}`,
                'gifUrl',
                `${gifUrl}`,
            ];
            const secondList = [
                'commentsCount',
                `${commentsCount}`,
                'reactions',
                JSON.stringify(reactions),
                'imgVersion',
                `${imgVersion}`,
                'imgId',
                `${imgId}`,
                'videoId',
                `${videoId}`,
                'videoVersion',
                `${videoVersion}`,
                'createdAt',
                `${createdAt}`,
            ];
            const dataToSave = [...firstList, ...secondList];
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const postsCount = yield this.client.HMGET(`users:${currentUserId}`, 'postsCount');
                const multi = this.client.multi();
                multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
                multi.HSET(`posts:${key}`, dataToSave);
                const count = parseInt(postsCount[0], 10) + 1;
                multi.HSET(`users:${currentUserId}`, ['postsCount', count]);
                multi.exec();
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getPostsFromCache(key, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const reply = yield this.client.ZRANGE(key, start, end, { REV: true });
                const multi = this.client.multi();
                reply.forEach((value) => {
                    multi.HGETALL(`posts:${value}`);
                });
                const replies = (yield multi.exec());
                const posts = [];
                for (const post of replies) {
                    post.commentsCount = helpers_1.Helpers.parseJson(`${post.commentsCount}`);
                    post.reactions = helpers_1.Helpers.parseJson(`${post.reactions}`);
                    post.createdAt = new Date(helpers_1.Helpers.parseJson(`${post.createdAt}`));
                    posts.push(post);
                }
                return posts;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getTotalPostNumberFromCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const count = yield this.client.ZCARD('post');
                return count;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getUserPostsFromCache(key, uId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const reply = yield this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });
                const multi = this.client.multi();
                reply.forEach((value) => {
                    multi.HGETALL(`posts:${value}`);
                });
                const replies = (yield multi.exec());
                const posts = [];
                for (const post of replies) {
                    post.commentsCount = helpers_1.Helpers.parseJson(`${post.commentsCount}`);
                    post.reactions = helpers_1.Helpers.parseJson(`${post.reactions}`);
                    post.createdAt = new Date(helpers_1.Helpers.parseJson(`${post.createdAt}`));
                    posts.push(post);
                }
                return posts;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getTotalUserPostNumberFromCache(uId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const count = yield this.client.ZCOUNT('post', uId, uId);
                return count;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    deletePostFromCache(key, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const postsCount = yield this.client.HMGET(`users:${currentUserId}`, 'postsCount');
                const multi = this.client.multi();
                multi.ZREM('post', `${key}`);
                multi.DEL(`posts:${key}`);
                multi.DEL(`comments:${key}`);
                multi.DEL(`reactions:${key}`);
                const count = parseInt(postsCount[0], 10) - 1;
                multi.HSET(`users:${currentUserId}`, ['postsCount', count]);
                yield multi.exec();
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    updatePostInCache(key, updatedPost) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const { post, bgColor, imgId, imgVersion, videoId, videoVersion, feelings, gifUrl, privacy, profilePicture, } = updatedPost;
                const dataToSave = [
                    'post',
                    `${post}`,
                    'bgColor',
                    `${bgColor}`,
                    'feelings',
                    `${feelings}`,
                    'privacy',
                    `${privacy}`,
                    'gifUrl',
                    `${gifUrl}`,
                    'imgVersion',
                    `${imgVersion || ''}`,
                    'imgId',
                    `${imgId || ''}`,
                    'profilePicture',
                    `${profilePicture}`,
                    'videoId',
                    `${videoId || ''}`,
                    'videoVersion',
                    `${videoVersion || ''}`,
                    'updatedAt',
                    `${new Date()}`,
                ];
                yield this.client.HSET(`posts:${key}`, dataToSave);
                const multi = this.client.multi();
                multi.HGETALL(`posts:${key}`);
                const reply = (yield multi.exec());
                const postReply = reply;
                postReply[0].commentsCount = helpers_1.Helpers.parseJson(`${postReply[0].commentsCount}`);
                postReply[0].reactions = helpers_1.Helpers.parseJson(`${postReply[0].reactions}`);
                postReply[0].createdAt = new Date(helpers_1.Helpers.parseJson(`${postReply[0].createdAt}`));
                postReply[0].updatedAt = new Date(helpers_1.Helpers.parseJson(`${postReply[0].updatedAt}`));
                return postReply[0];
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
}
exports.PostCache = PostCache;
//# sourceMappingURL=post.cache.js.map