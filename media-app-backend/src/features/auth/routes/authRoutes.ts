import { Router } from 'express';

import { signUp } from '@auth/controllers/signup';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/signup', signUp.create);

    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
