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
exports.blockUserService = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("../../../features/user/models/user.model");
class BlockUserService {
    blockUser(userId, blockedUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            user_model_1.UserModel.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: userId, blocked: { $ne: new mongoose_1.Types.ObjectId(blockedUserId) } },
                        update: {
                            $push: {
                                blocked: new mongoose_1.Types.ObjectId(blockedUserId),
                            },
                        },
                    },
                },
                {
                    updateOne: {
                        filter: { _id: blockedUserId, blockedBy: { $ne: new mongoose_1.Types.ObjectId(userId) } },
                        update: {
                            $push: {
                                blockedBy: new mongoose_1.Types.ObjectId(userId),
                            },
                        },
                    },
                },
            ]);
        });
    }
    unblockUser(userId, blockedUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            user_model_1.UserModel.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: userId },
                        update: {
                            $pull: {
                                blocked: new mongoose_1.Types.ObjectId(blockedUserId),
                            },
                        },
                    },
                },
                {
                    updateOne: {
                        filter: { _id: blockedUserId },
                        update: {
                            $pull: {
                                blockedBy: new mongoose_1.Types.ObjectId(userId),
                            },
                        },
                    },
                },
            ]);
        });
    }
}
exports.blockUserService = new BlockUserService();
//# sourceMappingURL=blockedUsers.service.js.map