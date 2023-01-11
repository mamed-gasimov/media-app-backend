import { IChatList, IChatUsers, IGetMessageFromCache, IMessageData } from '@chat/interfaces/chat.interface';
import { ServerError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';

const log = config.createLogger('chatCache');

export class ChatCache extends BaseCache {
  constructor() {
    super('chatCache');
  }

  public async addChatListToCache(senderId: string, receiverId: string, conversationId: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      if (userChatList.length === 0) {
        await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
      } else {
        const receiverIndex = userChatList.findIndex((listItem: string) => listItem.includes(receiverId));
        if (receiverIndex === -1) {
          await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
        }
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async addChatMessageToCache(conversationId: string, value: IMessageData) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(`messages:${conversationId}`, JSON.stringify(value));
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async addChatUsersToCache(value: IChatUsers) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      const usersIndex = users.findIndex(
        (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value)
      );

      let chatUsers: IChatUsers[] = [];
      if (usersIndex === -1) {
        await this.client.RPUSH('chatUsers', JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removeChatUsersFromCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      const usersIndex = users.findIndex(
        (listItem: IChatUsers) => JSON.stringify(listItem) === JSON.stringify(value)
      );
      let chatUsers: IChatUsers[] = [];
      if (usersIndex > -1) {
        await this.client.LREM('chatUsers', usersIndex, JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserConversationList(userId: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const userChatList = await this.client.LRANGE(`chatList:${userId}`, 0, -1);
      const conversationChatList: IMessageData[] = [];
      for (const item of userChatList) {
        const chatItem = Helpers.parseJson(item) as IChatList;
        const lastMessage = (await this.client.LINDEX(`messages:${chatItem.conversationId}`, -1)) as string;
        conversationChatList.push(Helpers.parseJson(lastMessage));
      }
      return conversationChatList;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getChatMessagesFromCache(senderId: string, receiverId: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      const receiver = userChatList.find((listItem: string) => listItem.includes(receiverId)) as string;
      const parsedReceiver = Helpers.parseJson(receiver) as IChatList;

      if (parsedReceiver) {
        const userMessages = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
        const chatMessages: IMessageData[] = [];
        for (const item of userMessages) {
          const chatItem = Helpers.parseJson(item) as IMessageData;
          chatMessages.push(chatItem);
        }
        return chatMessages;
      }

      return [];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async markMessageAsDeleted(
    senderId: string,
    receiverId: string,
    messageId: string,
    type: 'deleteForMe' | 'deleteForEveryone'
  ) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const foundMessage = await this.getMessage(senderId, receiverId, messageId);

      if (!foundMessage || !foundMessage?.message || foundMessage?.index === -1) {
        return null;
      }
      const { index, message, receiver } = foundMessage;
      const chatItem = Helpers.parseJson(message) as IMessageData;

      if (type === 'deleteForMe') {
        chatItem.deleteForMe = true;
        await this.client.LSET(`messages:${receiver.conversationId}`, index, JSON.stringify(chatItem));
        const lastMessage = (await this.client.LINDEX(
          `messages:${receiver.conversationId}`,
          index
        )) as string;
        return Helpers.parseJson(lastMessage) as IMessageData;
      } else if (type === 'deleteForEveryone') {
        await this.client.LREM(`messages:${receiver.conversationId}`, index, JSON.stringify(chatItem));
      }

      return null;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateChatMessages(senderId: string, receiverId: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      const receiver = userChatList.find((listItem: string) => listItem.includes(receiverId)) as string;
      const parsedReceiver = Helpers.parseJson(receiver) as IChatList;
      const messages = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
      const unreadMessages = messages.filter((listItem: string) => !Helpers.parseJson(listItem).isRead);

      for (const item of unreadMessages) {
        const chatItem = Helpers.parseJson(item) as IMessageData;
        const index = messages.findIndex((listItem: string) => listItem.includes(`${chatItem._id}`));
        chatItem.isRead = true;
        await this.client.LSET(`messages:${chatItem.conversationId}`, index, JSON.stringify(chatItem));
      }

      const lastMessage = (await this.client.LINDEX(
        `messages:${parsedReceiver.conversationId}`,
        -1
      )) as string;
      return Helpers.parseJson(lastMessage) as IMessageData;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  private async getChatUsersList() {
    const chatUsersList: IChatUsers[] = [];
    const chatUsers = await this.client.LRANGE('chatUsers', 0, -1);
    for (const item of chatUsers) {
      const chatUser = Helpers.parseJson(item) as IChatUsers;
      chatUsersList.push(chatUser);
    }
    return chatUsersList;
  }

  private async getMessage(
    senderId: string,
    receiverId: string,
    messageId: string
  ): Promise<IGetMessageFromCache> {
    const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
    const receiver = userChatList.find((listItem: string) => listItem.includes(receiverId)) as string;
    const parsedReceiver = Helpers.parseJson(receiver) as IChatList;
    const messages = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
    const message = messages.find((listItem: string) => listItem.includes(messageId)) as string;
    const index = messages.findIndex((listItem: string) => listItem.includes(messageId));

    return { index, message, receiver: parsedReceiver };
  }
}
