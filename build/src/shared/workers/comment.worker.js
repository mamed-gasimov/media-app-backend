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
exports.commentWorker = void 0;
const config_1 = require("../../config");
const comment_service_1 = require("../services/db/comment.service");
const log = config_1.config.createLogger('commentWorker');
class CommentWorker {
    savePostCommentToDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = job;
                yield comment_service_1.commentService.addPostCommentToDb(data);
                job.progress(100);
                done(null, data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
}
exports.commentWorker = new CommentWorker();
//# sourceMappingURL=comment.worker.js.map