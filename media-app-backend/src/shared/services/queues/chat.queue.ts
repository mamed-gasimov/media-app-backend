import { ProcessPromiseFunction } from 'bull';

import { IChatJobData, IMessageData } from '@chat/interfaces/chat.interface';
import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';
import { chatWorker } from '@worker/chat.worker';

class ChatQueue extends BaseQueue {
  constructor() {
    super('chats');
    this.processJob(
      'addChatMessageToDb',
      5,
      chatWorker.addChatMessageToDb as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'markMessageAsDeletedInDb',
      5,
      chatWorker.markMessageAsDeleted as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'markMessagesAsReadInDb',
      5,
      chatWorker.markMessagesAsReadInDb as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'updateMessageReaction',
      5,
      chatWorker.updateMessageReaction as ProcessPromiseFunction<IBaseJobData>
    );
  }

  public addChatJob(name: string, data: IChatJobData | IMessageData) {
    this.addJob(name, data);
  }
}

export const chatQueue = new ChatQueue();
