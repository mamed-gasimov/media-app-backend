import { Router } from 'express';

import { signIn } from '@auth/controllers/signin';
import { signUp } from '@auth/controllers/signup';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/signup', signUp.create);
    this.router.post('/signin', signIn.read);

    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
