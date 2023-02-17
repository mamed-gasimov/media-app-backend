import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { addReactions } from '@reaction/controllers/addReactions';
import { removeReactions } from '@reaction/controllers/removeReaction';
import { getReactions } from '@reaction/controllers/getReactions';

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, addReactions.reactions);
    this.router.delete('/post/reaction', authMiddleware.checkAuthentication, removeReactions.reactions);
    this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, getReactions.reactions);
    this.router.post(
      '/post/reactions/reaction',
      authMiddleware.checkAuthentication,
      getReactions.singleReactionByUsername
    );
    this.router.post(
      '/post/reactions/user',
      authMiddleware.checkAuthentication,
      getReactions.reactionsByUsername
    );

    return this.router;
  }
}

export const reactionRoutes = new ReactionRoutes();
