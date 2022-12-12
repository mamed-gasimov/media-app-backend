import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { createPost } from '@post/controllers/createPost';
import { getPosts } from '@post/controllers/getPosts';

class PostRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/posts/:page', authMiddleware.checkAuthentication, getPosts.posts);
    this.router.post('/post/create', authMiddleware.checkAuthentication, createPost.post);

    return this.router;
  }
}

export const postRoutes = new PostRoutes();
