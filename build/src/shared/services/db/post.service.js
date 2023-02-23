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
exports.postService = void 0;
const post_model_1 = require("../../../features/post/models/post.model");
const user_model_1 = require("../../../features/user/models/user.model");
class PostService {
    addPostToDb(userId, createdPost) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = post_model_1.PostModel.create(createdPost);
            const user = user_model_1.UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
            yield Promise.all([post, user]);
        });
    }
    getPosts(query, skip = 0, limit = 0, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            const posts = yield post_model_1.PostModel.aggregate([
                { $match: query },
                { $sort: sort },
                { $skip: skip },
                { $limit: limit },
            ]);
            return posts;
        });
    }
    postCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return post_model_1.PostModel.find({}).countDocuments();
        });
    }
    findPostById(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            return post_model_1.PostModel.findOne({ _id: postId }).exec();
        });
    }
    deletePost(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletePost = post_model_1.PostModel.deleteOne({ _id: postId });
            const decrementPostCount = user_model_1.UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
            yield Promise.all([deletePost, decrementPostCount]);
        });
    }
    updatePost(postId, updatedPost) {
        return __awaiter(this, void 0, void 0, function* () {
            yield post_model_1.PostModel.updateOne({ _id: postId }, { $set: updatedPost });
        });
    }
}
exports.postService = new PostService();
//# sourceMappingURL=post.service.js.map