import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { chatService } from '@service/db/chat.service';
import { IMessageData } from '@chat/interfaces/chat.interface';

const log = config.createLogger('chatWorker');

class ChatWorker {
  async addChatMessageToDb(jobQueue: Job<IMessageData>, done: DoneCallback) {
    try {
      await chatService.addMessageToDb(jobQueue.data);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async markMessageAsDeleted(jobQueue: Job, done: DoneCallback) {
    try {
      const { messageId, type } = jobQueue.data;
      await chatService.markMessageAsDeleted(messageId, type);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async markMessagesAsReadInDb(jobQueue: Job, done: DoneCallback) {
    try {
      const { senderId, receiverId } = jobQueue.data;
      await chatService.markMessagesAsRead(senderId, receiverId);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updateMessageReaction(jobQueue: Job, done: DoneCallback) {
    try {
      const { messageId, senderName, reaction, type } = jobQueue.data;
      await chatService.updateMessageReaction(messageId, senderName, reaction, type);
      jobQueue.progress(100);
      done(null, jobQueue.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const chatWorker = new ChatWorker();
