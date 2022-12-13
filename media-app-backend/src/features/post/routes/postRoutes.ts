import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { createPost } from '@post/controllers/createPost';
import { deletePost } from '@post/controllers/deletePost';
import { getPosts } from '@post/controllers/getPosts';

class PostRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/posts/:page', authMiddleware.checkAuthentication, getPosts.posts);
    this.router.post('/post/create', authMiddleware.checkAuthentication, createPost.post);
    this.router.delete('/posts/:postId', authMiddleware.checkAuthentication, deletePost.post);

    return this.router;
  }
}

export const postRoutes = new PostRoutes();
