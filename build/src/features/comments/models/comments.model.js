"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsModel = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', index: true },
    comment: { type: String, default: '' },
    username: { type: String },
    avataColor: { type: String },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now() },
});
const CommentsModel = (0, mongoose_1.model)('Comment', commentSchema, 'Comment');
exports.CommentsModel = CommentsModel;
//# sourceMappingURL=comments.model.js.map