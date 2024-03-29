import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { UserCache } from '@service/redis/user.cache';
import { addChatSchema, chatUserSchema } from '@chat/schemas/chat';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IMessageData, IMessageNotification } from '@chat/interfaces/chat.interface';
import { uploads } from '@global/helpers/cloudinaryUpload';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';
import { config } from '@root/config';
import { socketIOChatObject } from '@socket/chat.sockets';
import { notificationTemplate } from '@service/emails/templates/notifications/notificationTemplate';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';
import { emailQueue } from '@service/queues/email.queue';
import { ChatCache } from '@service/redis/chat.cache';
import { userService } from '@service/db/user.service';
import { chatQueue } from '@service/queues/chat.queue';

const userCache = new UserCache();
const chatCache = new ChatCache();

class AddChatMessage {
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response) {
    const { conversationId, receiverId, body, gifUrl, isRead, selectedImage } = req.body;

    if (!Helpers.checkValidObjectId(receiverId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (receiverId === `${req.currentUser?.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    const receiverUser = await userService.getUserById(receiverId);
    if (!receiverUser) {
      throw new BadRequestError('User was not found.');
    }

    let fileUrl = '';
    const messageObjectId = new ObjectId();
    const conversationObjectId = !conversationId ? new ObjectId() : new ObjectId(conversationId);
    let sender = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
    if (!sender) {
      sender = (await userService.getUserById(req.currentUser!.userId)) as IUserDocument;
    }

    if (selectedImage) {
      if (Helpers.isDataBase64(selectedImage)) {
        const result = await uploads(selectedImage, req.currentUser!.userId, true, true);
        if (!result?.public_id) {
          throw new BadRequestError(result?.message || 'File upload: Error occurred. Try again.');
        }
        fileUrl = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
      } else {
        throw new BadRequestError('Incorrect file format.');
      }
    }

    const messageData: IMessageData = {
      _id: `${messageObjectId}`,
      conversationId: new Types.ObjectId(conversationObjectId),
      receiverId,
      receiverAvatarColor: receiverUser.avatarColor || '',
      receiverProfilePicture: receiverUser.profilePicture || '',
      receiverUsername: receiverUser.username || '',
      senderUsername: `${req.currentUser!.username}`,
      senderId: `${req.currentUser!.userId}`,
      senderAvatarColor: `${req.currentUser!.avatarColor}`,
      senderProfilePicture: `${sender.profilePicture}`,
      body,
      isRead,
      gifUrl,
      selectedImage: fileUrl,
      reaction: {
        sender: { username: `${req.currentUser!.username}`, reactionType: undefined },
        receiver: { username: receiverUser.username as string, reactionType: undefined },
      },
      createdAt: new Date(),
      deleteForMe: false,
    };

    AddChatMessage.prototype.emitSocketIOEvent(messageData);

    if (!isRead) {
      AddChatMessage.prototype.messageNotification({
        currentUser: req.currentUser!,
        message: body,
        receiverName: receiverUser.username!,
        receiverId,
      });
    }

    await chatCache.addChatListToCache(
      `${req.currentUser!.userId}`,
      `${receiverId}`,
      `${conversationObjectId}`
    );
    await chatCache.addChatListToCache(
      `${receiverId}`,
      `${req.currentUser!.userId}`,
      `${conversationObjectId}`
    );
    await chatCache.addChatMessageToCache(`${conversationObjectId}`, messageData);

    chatQueue.addChatJob('addChatMessageToDb', messageData);
    res.status(HTTP_STATUS.OK).json({ message: 'Message added', conversationId: conversationObjectId });
  }

  @joiValidation(chatUserSchema)
  public async addChatUsers(req: Request, res: Response) {
    const { receiverId } = req.body;
    if (!Helpers.checkValidObjectId(receiverId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (receiverId === `${req.currentUser?.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    const chatUsers = await chatCache.addChatUsersToCache({
      userOne: `${req.currentUser!.userId}`,
      userTwo: receiverId,
    });
    socketIOChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users added' });
  }

  @joiValidation(chatUserSchema)
  public async removeChatUsers(req: Request, res: Response) {
    const { receiverId } = req.body;
    if (!Helpers.checkValidObjectId(receiverId)) {
      throw new BadRequestError('Invalid request.');
    }

    if (receiverId === `${req.currentUser?.userId}`) {
      throw new BadRequestError('Invalid request.');
    }

    const chatUsers = await chatCache.removeChatUsersFromCache({
      userOne: `${req.currentUser!.userId}`,
      userTwo: receiverId,
    });
    socketIOChatObject.emit('add chat users', chatUsers);
    res.status(HTTP_STATUS.OK).json({ message: 'Users removed' });
  }

  private emitSocketIOEvent(data: IMessageData) {
    socketIOChatObject.emit('message received', data);
    socketIOChatObject.emit('chat list', data);
  }

  private async messageNotification({
    currentUser,
    message,
    receiverName,
    receiverId,
  }: IMessageNotification) {
    const cachedUser =
      ((await userCache.getUserFromCache(`${receiverId}`)) as IUserDocument) ||
      ((await userService.getUserById(receiverId)) as IUserDocument);
    if (cachedUser?.notifications?.messages) {
      const templateParams: INotificationTemplate = {
        username: receiverName,
        message,
        header: `Message notification from ${currentUser.username}`,
      };

      const template = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('directMessageEmail', {
        receiverEmail: cachedUser.email!,
        template,
        subject: `You've received messages from ${currentUser.username}`,
      });
    }
  }
}

export const addChatMessage = new AddChatMessage();
