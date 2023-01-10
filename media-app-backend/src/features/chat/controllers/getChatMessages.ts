import { Request, Response } from 'express';
import { Types } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { IMessageData } from '@chat/interfaces/chat.interface';
import { chatService } from '@service/db/chat.service';
import { ChatCache } from '@service/redis/chat.cache';

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
}

export const getChatMessages = new GetChatMessages();
