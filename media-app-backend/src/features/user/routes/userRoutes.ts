import express, { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { getUserProfiles } from '@user/controllers/getUserProfiles';

class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/users/all', authMiddleware.checkAuthentication, getUserProfiles.all);
    this.router.get('/users/:userId', authMiddleware.checkAuthentication, getUserProfiles.profileByUserId);
    this.router.get('/user/profile', authMiddleware.checkAuthentication, getUserProfiles.currentUserProfile);
    this.router.get(
      '/user/posts/:userId',
      authMiddleware.checkAuthentication,
      getUserProfiles.profileAndPosts
    );

    return this.router;
  }
}

export const userRoutes = new UserRoutes();
