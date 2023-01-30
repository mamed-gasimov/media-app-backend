import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Types } from 'mongoose';

import { ChatCache } from '@service/redis/chat.cache';
import { socketIOChatObject } from '@socket/chat.sockets';
import { chatQueue } from '@service/queues/chat.queue';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { chatUserSchema } from '@chat/schemas/chat';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';

const chatCache = new ChatCache();

export class UpdateChatMessage {
  @joiValidation(chatUserSchema)
  public async markMessageAsRead(req: Request, res: Response) {
    const { receiverId } = req.body;

    if (!Helpers.checkValidObjectId(receiverId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (receiverId === `${req.currentUser!.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    const updatedMessage = await chatCache.updateChatMessages(`${req.currentUser!.userId}`, `${receiverId}`);
    socketIOChatObject.emit('message read', updatedMessage);
    socketIOChatObject.emit('chat list', updatedMessage);

    chatQueue.addChatJob('markMessagesAsReadInDb', {
      senderId: new Types.ObjectId(req.currentUser!.userId),
      receiverId: new Types.ObjectId(receiverId),
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Message marked as read' });
  }
}

export const updateChatMessage = new UpdateChatMessage();
