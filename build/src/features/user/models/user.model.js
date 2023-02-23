"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    authId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Auth', index: true },
    profilePicture: { type: String, default: '' },
    postsCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number },
    blocked: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    notifications: {
        messages: { type: Boolean, default: true },
        reactions: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        follows: { type: Boolean, default: true },
    },
    social: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        youtube: { type: String, default: '' },
    },
    work: { type: String, default: '' },
    school: { type: String, default: '' },
    location: { type: String, default: '' },
    quote: { type: String, default: '' },
    bgImageVersion: { type: String, default: '' },
    bgImageId: { type: String, default: '' },
});
exports.UserModel = (0, mongoose_1.model)('User', userSchema, 'User');
//# sourceMappingURL=user.model.js.map