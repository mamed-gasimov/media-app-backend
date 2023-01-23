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

    return this.router;
  }
}

export const userRoutes = new UserRoutes();
