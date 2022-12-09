import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { createPost } from '@post/controllers/createPost';

class PostRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/post/create', authMiddleware.checkAuthentication, createPost.post);

    return this.router;
  }
}

export const postRoutes = new PostRoutes();
