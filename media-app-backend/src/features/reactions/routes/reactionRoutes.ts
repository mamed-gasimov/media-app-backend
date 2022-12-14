import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { addReactions } from '@reaction/controllers/addReactions';

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, addReactions.reactions);

    return this.router;
  }
}

export const reactionRoutes = new ReactionRoutes();
