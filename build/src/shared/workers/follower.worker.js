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
exports.followerWorker = void 0;
const config_1 = require("../../config");
const follower_service_1 = require("../services/db/follower.service");
const log = config_1.config.createLogger('followerWorker');
class FollowerWorker {
    addFollowerToDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { keyOne, keyTwo, username, followerDocumentId } = job.data;
                yield follower_service_1.followerService.addFollowerToDb(keyOne, keyTwo, username, followerDocumentId);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    removeFollowerFromDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { keyOne, keyTwo } = job.data;
                yield follower_service_1.followerService.removeFollowerFromDb(keyOne, keyTwo);
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
exports.followerWorker = new FollowerWorker();
//# sourceMappingURL=follower.worker.js.map