import { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { addChatMessage } from '@chat/controllers/addChatMessage';
import { getChatMessages } from '@chat/controllers/getChatMessages';
import { deleteChatMessage } from '@chat/controllers/deleteChatMessage';
import { updateChatMessage } from '@chat/controllers/updateChatMessage';
import { addMessageReaction } from '@chat/controllers/addMessageReaction';

class ChatRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get(
      '/chat/conversation-list',
      authMiddleware.checkAuthentication,
      getChatMessages.conversationList
    );
    this.router.get(
      '/chat/messages/:receiverId',
      authMiddleware.checkAuthentication,
      getChatMessages.messages
    );

    this.router.post('/chat/message', authMiddleware.checkAuthentication, addChatMessage.message);
    this.router.post('/chat/users', authMiddleware.checkAuthentication, addChatMessage.addChatUsers);

    this.router.put('/chat/message', authMiddleware.checkAuthentication, updateChatMessage.markMessageAsRead);
    this.router.put(
      '/chat/message/reaction',
      authMiddleware.checkAuthentication,
      addMessageReaction.reaction
    );

    this.router.delete('/chat/users', authMiddleware.checkAuthentication, addChatMessage.removeChatUsers);
    this.router.delete(
      '/chat/message',
      authMiddleware.checkAuthentication,
      deleteChatMessage.markMessageAsDeleted
    );

    return this.router;
  }
}

export const chatRoutes = new ChatRoutes();
