import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { getComments } from '@comment/controllers/getComments';
import { addComment } from '@comment/controllers/addComment';

class CommentRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/post/:postId/comments', authMiddleware.checkAuthentication, getComments.comments);
    this.router.get(
      '/post/:postId/commentsnames',
      authMiddleware.checkAuthentication,
      getComments.commentNames
    );
    this.router.get(
      '/post/:postId/comments/:commentId',
      authMiddleware.checkAuthentication,
      getComments.singleComment
    );

    this.router.post('/post/comment', authMiddleware.checkAuthentication, addComment.comments);

    return this.router;
  }
}

export const commentRoutes = new CommentRoutes();
