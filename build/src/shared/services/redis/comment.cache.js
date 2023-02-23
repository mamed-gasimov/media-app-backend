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
exports.CommentsCache = void 0;
const errorHandler_1 = require("../../globals/helpers/errorHandler");
const helpers_1 = require("../../globals/helpers/helpers");
const config_1 = require("../../../config");
const base_cache_1 = require("../redis/base.cache");
const log = config_1.config.createLogger('commentsCache');
class CommentsCache extends base_cache_1.BaseCache {
    constructor() {
        super('commentsCache');
    }
    savePostCommentToCache(postId, commentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                yield this.client.LPUSH(`comments:${postId}`, commentData);
                const commentsCount = yield this.client.HMGET(`posts:${postId}`, 'commentsCount');
                const count = Number(commentsCount[0]) + 1;
                const dataToSave = ['commentsCount', `${count}`];
                yield this.client.HSET(`posts:${postId}`, dataToSave);
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getPostCommentsFromCache(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const reply = yield this.client.LRANGE(`comments:${postId}`, 0, -1);
                const list = [];
                for (const item of reply) {
                    list.push(helpers_1.Helpers.parseJson(item));
                }
                return list;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getCommentsNamesFromCache(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const commentsCount = yield this.client.LLEN(`comments:${postId}`);
                const comments = yield this.client.LRANGE(`comments:${postId}`, 0, -1);
                const list = [];
                for (const item of comments) {
                    const comment = helpers_1.Helpers.parseJson(item);
                    list.push(comment.username);
                }
                const response = {
                    count: commentsCount,
                    names: list,
                };
                return [response];
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getSingleCommentFromCache(postId, commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const comments = yield this.client.LRANGE(`comments:${postId}`, 0, -1);
                const list = [];
                for (const item of comments) {
                    list.push(helpers_1.Helpers.parseJson(item));
                }
                const result = list.find((listItem) => {
                    return listItem._id === commentId;
                });
                return [result];
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
}
exports.CommentsCache = CommentsCache;
//# sourceMappingURL=comment.cache.js.map