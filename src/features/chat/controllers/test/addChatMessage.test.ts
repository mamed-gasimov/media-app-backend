import { Types } from 'mongoose';
import { Server } from 'socket.io';

import * as chatServer from '@socket/chat.sockets';
import { chatMessage, chatMessageBody, chatMockRequest, chatMockResponse } from '@root/mocks/chat.mock';
import { addChatMessage } from '@chat/controllers/addChatMessage';
import { chatQueue } from '@service/queues/chat.queue';
import { authUserPayload } from '@root/mocks/auth.mock';
import { ChatCache } from '@service/redis/chat.cache';
import { emailQueue } from '@service/queues/email.queue';
import { existingUser, existingUserTwo, mergedAuthAndUserData } from '@root/mocks/user.mock';
import { notificationTemplate } from '@service/emails/templates/notifications/notificationTemplate';
import { UserCache } from '@service/redis/user.cache';
import { userService } from '@service/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@socket/user.sockets');
jest.mock('@service/redis/user.cache');
jest.mock('@service/redis/chat.cache');
jest.mock('@service/queues/email.queue');

Object.defineProperties(chatServer, {
  socketIOChatObject: {
    value: new Server(),
    writable: true,
  },
});

describe('Add Chat Message', () => {
  beforeEach(() => {
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if receiverId is empty', async () => {
    const req = chatMockRequest({}, { ...chatMessageBody, receiverId: '' }, authUserPayload);
    const res = chatMockResponse();
    addChatMessage.message(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"receiverId" is not allowed to be empty');
    });
  });

  it('should throw an error if receiverId is not valid mongodb ObjectId', async () => {
    const req = chatMockRequest({}, { ...chatMessageBody, receiverId: '12345' }, authUserPayload);
    const res = chatMockResponse();
    addChatMessage.message(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if receiverId is equal to current user id', async () => {
    const req = chatMockRequest(
      {},
      { ...chatMessageBody, receiverId: authUserPayload.userId },
      authUserPayload
    );
    const res = chatMockResponse();
    addChatMessage.message(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if user with receiverId was not found', async () => {
    const req = chatMockRequest({}, chatMessageBody, authUserPayload);
    const res = chatMockResponse();
    jest.spyOn(userService, 'getUserById').mockResolvedValue(undefined);

    addChatMessage.message(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('User was not found.');
    });
  });

  it('should call socket.io emit twice', async () => {
    jest.spyOn(chatServer.socketIOChatObject, 'emit');
    const req = chatMockRequest({}, chatMessageBody, authUserPayload);
    const res = chatMockResponse();
    jest.spyOn(userService, 'getUserById').mockResolvedValue(mergedAuthAndUserData);

    await addChatMessage.message(req, res);
    expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
  });

  it('should call addEmailJob method', async () => {
    existingUserTwo.notifications.messages = true;
    const req = chatMockRequest({}, chatMessageBody, authUserPayload);
    const res = chatMockResponse();
    const userData = { ...mergedAuthAndUserData, username: 'Danny' };
    jest.spyOn(userService, 'getUserById').mockResolvedValue(userData as IUserDocument);
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUserTwo);
    jest.spyOn(emailQueue, 'addEmailJob');

    const templateParams = {
      username: existingUserTwo.username!,
      message: chatMessage.body,
      header: `Message notification from ${req.currentUser!.username}`,
    };
    const template = notificationTemplate.notificationMessageTemplate(templateParams);

    await addChatMessage.message(req, res);
    expect(emailQueue.addEmailJob).toHaveBeenCalledWith('directMessageEmail', {
      receiverEmail: existingUserTwo.email!,
      template,
      subject: `You've received messages from ${req.currentUser!.username!}`,
    });
  });

  it('should not call addEmailJob method', async () => {
    chatMessage.isRead = true;
    const req = chatMockRequest({}, chatMessageBody, authUserPayload);
    const res = chatMockResponse();
    jest.spyOn(userService, 'getUserById').mockResolvedValue(mergedAuthAndUserData);
    jest.spyOn(emailQueue, 'addEmailJob');

    const templateParams = {
      username: existingUserTwo.username!,
      message: chatMessage.body,
      header: `Message Notification from ${req.currentUser!.username}`,
    };
    const template = notificationTemplate.notificationMessageTemplate(templateParams);

    await addChatMessage.message(req, res);
    expect(emailQueue.addEmailJob).not.toHaveBeenCalledWith('directMessageMail', {
      receiverEmail: req.currentUser!.email,
      template,
      subject: `You've received messages from ${existingUserTwo.username!}`,
    });
  });

  it('should call addChatListToCache twice', async () => {
    jest.spyOn(ChatCache.prototype, 'addChatListToCache');
    const req = chatMockRequest({}, chatMessageBody, authUserPayload);
    const res = chatMockResponse();
    jest.spyOn(userService, 'getUserById').mockResolvedValue(mergedAuthAndUserData);

    await addChatMessage.message(req, res);
    expect(ChatCache.prototype.addChatListToCache).toHaveBeenCalledTimes(2);
  });

  it('should call addChatMessageToCache', async () => {
    jest.spyOn(ChatCache.prototype, 'addChatMessageToCache');
    const req = chatMockRequest({}, chatMessageBody, authUserPayload);
    const res = chatMockResponse();
    jest.spyOn(userService, 'getUserById').mockResolvedValue(mergedAuthAndUserData);

    await addChatMessage.message(req, res);
    expect(ChatCache.prototype.addChatMessageToCache).toHaveBeenCalledTimes(1);
  });

  it('should call chatQueue addChatJob', async () => {
    jest.spyOn(chatQueue, 'addChatJob');
    const req = chatMockRequest({}, chatMessageBody, authUserPayload);
    const res = chatMockResponse();
    jest.spyOn(userService, 'getUserById').mockResolvedValue(mergedAuthAndUserData);

    await addChatMessage.message(req, res);
    expect(chatQueue.addChatJob).toHaveBeenCalledTimes(1);
  });

  it('should send correct json response', async () => {
    const req = chatMockRequest({}, chatMessageBody, authUserPayload);
    const res = chatMockResponse();
    jest.spyOn(userService, 'getUserById').mockResolvedValue(mergedAuthAndUserData);

    await addChatMessage.message(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Message added',
      conversationId: new Types.ObjectId(`${chatMessage.conversationId}`),
    });
  });
});
