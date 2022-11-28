import { Router } from 'express';

import { signIn } from '@auth/controllers/signin';
import { signOut } from '@auth/controllers/signout';
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

  public signOutRoute(): Router {
    this.router.get('/signout', signOut.update);

    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
