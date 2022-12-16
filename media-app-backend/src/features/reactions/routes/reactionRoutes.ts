import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { addReactions } from '@reaction/controllers/addReactions';
import { removeReactions } from '@reaction/controllers/removeReaction';

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, addReactions.reactions);
    this.router.delete('/post/reaction', authMiddleware.checkAuthentication, removeReactions.reactions);

    return this.router;
  }
}

export const reactionRoutes = new ReactionRoutes();
