import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { addChatMessage } from '@chat/controllers/addChatMessage';

class ChatRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/chat/message', authMiddleware.checkAuthentication, addChatMessage.message);

    return this.router;
  }
}

export const chatRoutes = new ChatRoutes();
