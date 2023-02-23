"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    username: { type: String },
    email: { type: String },
    avatarColor: { type: String },
    profilePicture: { type: String },
    post: { type: String, default: '' },
    bgColor: { type: String, default: '' },
    imgVersion: { type: String, default: '' },
    imgId: { type: String, default: '' },
    videoVersion: { type: String, default: '' },
    videoId: { type: String, default: '' },
    feelings: { type: String, default: '' },
    gifUrl: { type: String, default: '' },
    privacy: { type: String, default: '' },
    commentsCount: { type: Number, default: 0 },
    reactions: {
        like: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        happy: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date || null, default: null },
});
exports.PostModel = (0, mongoose_1.model)('Post', postSchema, 'Post');
//# sourceMappingURL=post.model.js.map