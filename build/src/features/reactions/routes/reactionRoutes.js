"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../../shared/globals/helpers/authMiddleware");
const addReactions_1 = require("../controllers/addReactions");
const removeReaction_1 = require("../controllers/removeReaction");
const getReactions_1 = require("../controllers/getReactions");
class ReactionRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
    }
    routes() {
        this.router.post('/post/reaction', authMiddleware_1.authMiddleware.checkAuthentication, addReactions_1.addReactions.reactions);
        this.router.delete('/post/reaction', authMiddleware_1.authMiddleware.checkAuthentication, removeReaction_1.removeReactions.reactions);
        this.router.get('/post/reactions/:postId', authMiddleware_1.authMiddleware.checkAuthentication, getReactions_1.getReactions.reactions);
        this.router.post('/post/reactions/reaction', authMiddleware_1.authMiddleware.checkAuthentication, getReactions_1.getReactions.singleReactionByUsername);
        this.router.post('/post/reactions/user', authMiddleware_1.authMiddleware.checkAuthentication, getReactions_1.getReactions.reactionsByUsername);
        return this.router;
    }
}
exports.reactionRoutes = new ReactionRoutes();
//# sourceMappingURL=reactionRoutes.js.map