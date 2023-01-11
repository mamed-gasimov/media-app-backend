import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Types } from 'mongoose';

import { ChatCache } from '@service/redis/chat.cache';
import { socketIOChatObject } from '@socket/chat.sockets';
import { chatQueue } from '@service/queues/chat.queue';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { deleteChatMessageSchema } from '@chat/schemas/chat';

const chatCache = new ChatCache();

export class DeleteChatMessage {
  @joiValidation(deleteChatMessageSchema)
  public async markMessageAsDeleted(req: Request, res: Response) {
    const { receiverId, messageId, type } = req.body;

    if (!Helpers.checkValidObjectId(receiverId) || !Helpers.checkValidObjectId(messageId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (receiverId === `${req.currentUser!.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    const updatedMessage = await chatCache.markMessageAsDeleted(
      `${req.currentUser!.userId}`,
      `${receiverId}`,
      `${messageId}`,
      type
    );

    socketIOChatObject.emit('message read', updatedMessage);
    socketIOChatObject.emit('chat list', updatedMessage);
    chatQueue.addChatJob('markMessageAsDeletedInDb', {
      messageId: new Types.ObjectId(messageId),
      type,
    });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: type === 'deleteForMe' ? 'Message marked as deleted' : 'Message was deleted' });
  }
}

export const deleteChatMessage = new DeleteChatMessage();
