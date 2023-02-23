"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
const createPost_1 = require("../controllers/createPost");
const deletePost_1 = require("../controllers/deletePost");
const getPosts_1 = require("../controllers/getPosts");
const updatePost_1 = require("../controllers/updatePost");
class PostRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.get('/posts/:page', authMiddleware_1.authMiddleware.checkAuthentication, getPosts_1.getPosts.posts);
        this.router.post('/post/create', authMiddleware_1.authMiddleware.checkAuthentication, createPost_1.createPost.post);
        this.router.delete('/posts/:postId', authMiddleware_1.authMiddleware.checkAuthentication, deletePost_1.deletePost.post);
        this.router.put('/posts/:postId', authMiddleware_1.authMiddleware.checkAuthentication, updatePost_1.updatePost.post);
        return this.router;
    }
}
exports.postRoutes = new PostRoutes();
//# sourceMappingURL=postRoutes.js.map