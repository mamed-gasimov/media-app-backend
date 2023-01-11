import { ObjectId } from 'mongodb';

import { IMessageData } from '@chat/interfaces/chat.interface';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '@chat/models/chat.model';
import { ConversationModel } from '@chat/models/conversation.model';
import { ReactionType } from '@reaction/interfaces/reaction.interface';

class ChatService {
  public async addMessageToDb(data: IMessageData) {
    const conversation: IConversationDocument[] = await ConversationModel.find({
      _id: data?.conversationId,
    }).exec();

    if (!conversation.length) {
      await ConversationModel.create({
        _id: data?.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
      });
    }

    await MessageModel.create({
      _id: data._id,
      conversationId: data.conversationId,
      receiverId: data.receiverId,
      receiverUsername: data.receiverUsername,
      receiverAvatarColor: data.receiverAvatarColor,
      receiverProfilePicture: data.receiverProfilePicture,
      senderUsername: data.senderUsername,
      senderId: data.senderId,
      senderAvatarColor: data.senderAvatarColor,
      senderProfilePicture: data.senderProfilePicture,
      body: data.body,
      isRead: data.isRead,
      gifUrl: data.gifUrl,
      selectedImage: data.selectedImage,
      reaction: data.reaction,
      createdAt: data.createdAt,
    });
  }

  public async getUserConversationList(userId: ObjectId) {
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      {
        $group: {
          _id: '$conversationId',
          result: { $last: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          receiverId: '$result.receiverId',
          receiverUsername: '$result.receiverUsername',
          receiverAvatarColor: '$result.receiverAvatarColor',
          receiverProfilePicture: '$result.receiverProfilePicture',
          senderUsername: '$result.senderUsername',
          senderId: '$result.senderId',
          senderAvatarColor: '$result.senderAvatarColor',
          senderProfilePicture: '$result.senderProfilePicture',
          body: '$result.body',
          isRead: '$result.isRead',
          gifUrl: '$result.gifUrl',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt',
        },
      },
      { $sort: { createdAt: 1 } },
    ]);
    return messages;
  }

  public async getMessages(senderId: ObjectId, receiverId: ObjectId, sort: Record<string, 1 | -1>) {
    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    };
    const messages: IMessageData[] = await MessageModel.aggregate([{ $match: query }, { $sort: sort }]);
    return messages;
  }

  public async markMessageAsDeleted(messageId: string, type: 'deleteForMe' | 'deleteForEveryone') {
    if (type === 'deleteForMe') {
      await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true } }).exec();
    } else if (type === 'deleteForEveryone') {
      await MessageModel.deleteOne({ _id: messageId }).exec();
    }
  }

  public async markMessagesAsRead(senderId: ObjectId, receiverId: ObjectId) {
    const query = {
      $or: [
        { senderId, receiverId, isRead: false },
        { senderId: receiverId, receiverId: senderId, isRead: false },
      ],
    };
    await MessageModel.updateMany(query, { $set: { isRead: true } }).exec();
  }

  public async updateMessageReaction(
    messageId: ObjectId,
    reaction: ReactionType,
    type: 'add' | 'remove',
    userType: 'sender' | 'receiver'
  ) {
    const prop = `reaction.${userType}.reactionType`;
    if (type === 'add') {
      await MessageModel.updateOne({ _id: messageId }, { $set: { [prop]: reaction } });
    } else if (type === 'remove') {
      await MessageModel.updateOne({ _id: messageId }, { $set: { [prop]: '' } }).exec();
    }
  }

  public async getMessageById(messageId: ObjectId) {
    return MessageModel.findOne({ _id: messageId });
  }
}

export const chatService = new ChatService();
