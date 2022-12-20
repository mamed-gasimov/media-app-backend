import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { followUser } from '@follower/controllers/followUser';

class FollowerRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, followUser.follower);

    return this.router;
  }
}

export const followerRoutes = new FollowerRoutes();
