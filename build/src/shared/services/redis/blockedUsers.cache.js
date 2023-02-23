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
exports.BlockedUsersCache = void 0;
const lodash_1 = require("lodash");
const config_1 = require("../../../config");
const errorHandler_1 = require("../../globals/helpers/errorHandler");
const helpers_1 = require("../../globals/helpers/helpers");
const base_cache_1 = require("../redis/base.cache");
const log = config_1.config.createLogger('blockedUsersCache');
class BlockedUsersCache extends base_cache_1.BaseCache {
    constructor() {
        super('blockedUsersCache');
    }
    updateBlockedUserPropInCache(key, prop, userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.client.isOpen) {
                    yield this.client.connect();
                }
                const response = (yield this.client.HGET(`users:${key}`, prop));
                const multi = this.client.multi();
                let blocked = helpers_1.Helpers.parseJson(response);
                if (type === 'block') {
                    blocked = [...new Set([...blocked, userId])];
                }
                else if (type === 'unblock') {
                    (0, lodash_1.remove)(blocked, (id) => id === userId);
                    blocked = [...blocked];
                }
                const dataToSave = [`${prop}`, JSON.stringify(blocked)];
                multi.HSET(`users:${key}`, dataToSave);
                yield multi.exec();
            }
            catch (error) {
                log.error(error);
                throw new errorHandler_1.ServerError('Server error. Try again.');
            }
        });
    }
}
exports.BlockedUsersCache = BlockedUsersCache;
//# sourceMappingURL=blockedUsers.cache.js.map