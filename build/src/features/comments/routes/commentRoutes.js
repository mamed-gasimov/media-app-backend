"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
const getComments_1 = require("../controllers/getComments");
const addComment_1 = require("../controllers/addComment");
class CommentRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.get('/post/:postId/comments', authMiddleware_1.authMiddleware.checkAuthentication, getComments_1.getComments.comments);
        this.router.get('/post/:postId/commentsnames', authMiddleware_1.authMiddleware.checkAuthentication, getComments_1.getComments.commentNames);
        this.router.get('/post/:postId/comments/:commentId', authMiddleware_1.authMiddleware.checkAuthentication, getComments_1.getComments.singleComment);
        this.router.post('/post/comment', authMiddleware_1.authMiddleware.checkAuthentication, addComment_1.addComment.comments);
        return this.router;
    }
}
exports.commentRoutes = new CommentRoutes();
//# sourceMappingURL=commentRoutes.js.map