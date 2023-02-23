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
exports.userWorker = void 0;
const config_1 = require("../../config");
const user_service_1 = require("../services/db/user.service");
const log = config_1.config.createLogger('userWorker');
class UserWorker {
    addUserToDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { value } = job.data;
                user_service_1.userService.addUserData(value);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    updateUserInfo(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key, value } = job.data;
                yield user_service_1.userService.updateUserInfo(key, value);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    updateSocialLinks(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key, value } = job.data;
                yield user_service_1.userService.updateSocialLinks(key, value);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    updateNotificationSettings(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key, value } = job.data;
                yield user_service_1.userService.updateNotificationSettings(key, value);
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
exports.userWorker = new UserWorker();
//# sourceMappingURL=user.worker.js.map