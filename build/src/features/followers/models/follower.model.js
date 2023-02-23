"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowerModel = void 0;
const mongoose_1 = require("mongoose");
const followerSchema = new mongoose_1.Schema({
    followerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    followeeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    createdAt: { type: Date, default: Date.now() },
});
const FollowerModel = (0, mongoose_1.model)('Follower', followerSchema, 'Follower');
exports.FollowerModel = FollowerModel;
//# sourceMappingURL=follower.model.js.map