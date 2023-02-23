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
exports.postWorker = void 0;
const config_1 = require("../../config");
const post_service_1 = require("../services/db/post.service");
const log = config_1.config.createLogger('postWorker');
class PostWorker {
    savePostToDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key, value } = job.data;
                yield post_service_1.postService.addPostToDb(`${key}`, value);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    deletePostFromDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { keyOne, keyTwo } = job.data;
                yield post_service_1.postService.deletePost(`${keyOne}`, `${keyTwo}`);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    updatePostInDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { key, value } = job.data;
                yield post_service_1.postService.updatePost(`${key}`, value);
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
exports.postWorker = new PostWorker();
//# sourceMappingURL=post.worker.js.map