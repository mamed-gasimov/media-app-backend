import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Types } from 'mongoose';

import { ChatCache } from '@service/redis/chat.cache';
import { socketIOChatObject } from '@socket/chat.sockets';
import { chatQueue } from '@service/queues/chat.queue';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { addMessageReactionSchema } from '@chat/schemas/chat';
import { ReactionType } from '@reaction/interfaces/reaction.interface';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';

const chatCache = new ChatCache();

export class AddMessageReaction {
  @joiValidation(addMessageReactionSchema)
  public async reaction(req: Request, res: Response) {
    const { conversationId, messageId, reaction, type } = req.body;

    if (!Helpers.checkValidObjectId(conversationId) || !Helpers.checkValidObjectId(messageId)) {
      throw new BadRequestError('Invalid request.');
    }

    const updatedMessage = await chatCache.updateMessageReaction(
      `${conversationId}`,
      `${messageId}`,
      `${reaction as ReactionType}`,
      `${req.currentUser!.username}`,
      type
    );

    socketIOChatObject.emit('message reaction', updatedMessage);
    chatQueue.addChatJob('updateMessageReaction', {
      messageId: new Types.ObjectId(messageId),
      senderName: req.currentUser!.username,
      reaction,
      type,
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Message reaction added' });
  }
}

export const addMessageReaction = new AddMessageReaction();
