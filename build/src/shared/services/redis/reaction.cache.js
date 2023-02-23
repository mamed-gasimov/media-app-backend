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
exports.ReactionsCache = void 0;
const errorHandler_1 = require("../../globals/helpers/errorHandler");
const helpers_1 = require("../../globals/helpers/helpers");
const config_1 = require("../../../config");
const base_cache_1 = require("../redis/base.cache");
const log = config_1.config.createLogger('reactionsCache');
class ReactionsCache extends base_cache_1.BaseCache {
    constructor() {
        super('reactionsCache');
    }
    savePostReactionToCache(postId, reaction, type, previousReaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                if (previousReaction) {
                    yield this.removePostReactionFromCache(postId, reaction.username, previousReaction);
                }
                if (type) {
                    yield this.client.LPUSH(`reactions:${postId}`, JSON.stringify(reaction));
                    const postReactionsJson = yield this.client.HGET(`posts:${postId}`, 'reactions');
                    if (postReactionsJson) {
                        const postReactions = helpers_1.Helpers.parseJson(postReactionsJson);
                        const changedPostPeactions = Object.assign(Object.assign({}, postReactions), { [type]: postReactions[type] + 1 });
                        const dataToSave = ['reactions', JSON.stringify(changedPostPeactions)];
                        yield this.client.HSET(`posts:${postId}`, dataToSave);
                    }
                }
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    removePostReactionFromCache(postId, username, previousReaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const response = yield this.client.LRANGE(`reactions:${postId}`, 0, -1);
                const multi = this.client.multi();
                const userPreviousReaction = this.getPreviousReaction(response, username);
                multi.LREM(`reactions:${postId}`, 1, JSON.stringify(userPreviousReaction));
                yield multi.exec();
                const postReactionsJson = yield this.client.HGET(`posts:${postId}`, 'reactions');
                if (postReactionsJson && previousReaction) {
                    const postReactions = helpers_1.Helpers.parseJson(postReactionsJson);
                    const changedPostPeactions = Object.assign(Object.assign({}, postReactions), { [previousReaction]: postReactions[previousReaction] - 1 >= 0 ? postReactions[previousReaction] - 1 : 0 });
                    const dataToSave = ['reactions', JSON.stringify(changedPostPeactions)];
                    yield this.client.HSET(`posts:${postId}`, dataToSave);
                }
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getReactionsFromCache(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const response = yield this.client.LRANGE(`reactions:${postId}`, 0, -1);
                const list = response.map((item) => helpers_1.Helpers.parseJson(item));
                return list;
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getSingleReactionFromCache(postId, username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const response = yield this.client.LRANGE(`reactions:${postId}`, 0, -1);
                const list = response.map((item) => helpers_1.Helpers.parseJson(item));
                return list.find((listItem) => {
                    return (listItem === null || listItem === void 0 ? void 0 : listItem.postId) === postId && (listItem === null || listItem === void 0 ? void 0 : listItem.username) === username;
                });
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
    getPreviousReaction(response, username) {
        const list = [];
        for (const item of response) {
            list.push(helpers_1.Helpers.parseJson(item));
        }
        return list.find((listItem) => (listItem === null || listItem === void 0 ? void 0 : listItem.username) === username);
    }
}
exports.ReactionsCache = ReactionsCache;
//# sourceMappingURL=reaction.cache.js.map