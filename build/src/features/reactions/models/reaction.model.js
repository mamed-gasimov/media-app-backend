"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionModel = void 0;
const mongoose_1 = require("mongoose");
const reactionSchema = new mongoose_1.Schema({
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', index: true },
    type: { type: String, default: '' },
    username: { type: String, default: '' },
    avataColor: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now() },
});
const ReactionModel = (0, mongoose_1.model)('Reaction', reactionSchema, 'Reaction');
exports.ReactionModel = ReactionModel;
//# sourceMappingURL=reaction.model.js.map