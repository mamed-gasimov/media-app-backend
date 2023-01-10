import { Request, Response } from 'express';
import { Types } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatService } from '@service/db/chat.service';
import { ChatCache } from '@service/redis/chat.cache';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';

const chatCache = new ChatCache();

export class GetChatMessages {
  public async conversationList(req: Request, res: Response) {
    let list: IMessageData[] = [];
    const cachedList: IMessageData[] = await chatCache.getUserConversationList(`${req.currentUser!.userId}`);
    if (cachedList.length) {
      list = cachedList;
    } else {
      list = await chatService.getUserConversationList(new Types.ObjectId(req.currentUser!.userId));
    }

    res.status(HTTP_STATUS.OK).json({ message: 'User conversation list', list });
  }

  public async messages(req: Request, res: Response) {
    const { receiverId } = req.params;

    if (!Helpers.checkValidObjectId(receiverId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (receiverId === `${req.currentUser?.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    let messages: IMessageData[] = [];
    const cachedMessages: IMessageData[] = await chatCache.getChatMessagesFromCache(
      `${req.currentUser!.userId}`,
      `${receiverId}`
    );

    if (cachedMessages.length) {
      messages = cachedMessages;
    } else {
      messages = await chatService.getMessages(
        new Types.ObjectId(req.currentUser!.userId),
        new Types.ObjectId(receiverId),
        { createdAt: -1 }
      );
    }

    res.status(HTTP_STATUS.OK).json({ message: 'User chat messages', messages });
  }
}

export const getChatMessages = new GetChatMessages();
