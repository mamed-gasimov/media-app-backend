import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { followUser } from '@follower/controllers/followUser';
import { unfollowUser } from '@follower/controllers/unfollowUser';

class FollowerRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, followUser.follower);
    this.router.put('/user/unfollow/:followerId', authMiddleware.checkAuthentication, unfollowUser.follower);

    return this.router;
  }
}

export const followerRoutes = new FollowerRoutes();
