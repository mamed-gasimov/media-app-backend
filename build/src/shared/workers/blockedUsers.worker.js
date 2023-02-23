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
exports.blockedUsersWorker = void 0;
const config_1 = require("../../config");
const blockedUsers_service_1 = require("../services/db/blockedUsers.service");
const log = config_1.config.createLogger('blockedUsersWorker');
class BlockedUsersWorker {
    updateBlockUserInDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { keyOne, keyTwo, type } = job.data;
                if (type === 'block') {
                    yield blockedUsers_service_1.blockUserService.blockUser(keyOne, keyTwo);
                }
                else {
                    yield blockedUsers_service_1.blockUserService.unblockUser(keyOne, keyTwo);
                }
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
}
exports.blockedUsersWorker = new BlockedUsersWorker();
//# sourceMappingURL=blockedUsers.worker.js.map