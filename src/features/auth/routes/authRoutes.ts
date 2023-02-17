import { Router } from 'express';

import { passwordReset } from '@auth/controllers/passwordReset';
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
    this.router.post('/forgot-password', passwordReset.create);
    this.router.post('/reset-password/:token', passwordReset.update);

    return this.router;
  }

  public signOutRoute(): Router {
    this.router.get('/signout', signOut.update);

    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
