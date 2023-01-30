import { Router } from 'express';

import { currentUser } from '@auth/controllers/currentUser';
import { authMiddleware } from '@global/helpers/authMiddleware';

class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/currentuser', authMiddleware.checkAuthentication, currentUser.read);

    return this.router;
  }
}

export const currentUserRoutes = new CurrentUserRoutes();
