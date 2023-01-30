import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { blockedUsers } from '@blocked/controllers/blockedUsers';

class BlockedUsersRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.put('/user/block/:userId', authMiddleware.checkAuthentication, blockedUsers.block);
    this.router.put('/user/unblock/:userId', authMiddleware.checkAuthentication, blockedUsers.unblock);

    return this.router;
  }
}

export const blockedUsersRoutes = new BlockedUsersRoutes();
