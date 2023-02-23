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
exports.reactionWorker = void 0;
const config_1 = require("../../config");
const reaction_service_1 = require("../services/db/reaction.service");
const log = config_1.config.createLogger('reactionWorker');
class ReactionWorker {
    saveReactionToDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = job;
                yield reaction_service_1.reactionService.addReactionDataToDb(data);
                job.progress(100);
                done(null, job.data);
            }
            catch (error) {
                log.error(error);
                done(error);
            }
        });
    }
    removeReactionFromDb(job, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = job;
                yield reaction_service_1.reactionService.removeReactionDataFromDB(data);
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
exports.reactionWorker = new ReactionWorker();
//# sourceMappingURL=reaction.worker.js.map