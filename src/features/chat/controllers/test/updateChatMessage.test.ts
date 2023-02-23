import { Server } from 'socket.io';

import { authUserPayload } from '@root/mocks/auth.mock';
import { updateChatMessage } from '@chat/controllers/updateChatMessage';
import * as chatServer from '@socket/chat.sockets';
import { chatMockRequest, chatMockResponse } from '@root/mocks/chat.mock';
import { ChatCache } from '@service/redis/chat.cache';
import { chatQueue } from '@service/queues/chat.queue';
import { messageDataMock } from '@root/mocks/chat.mock';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/chat.cache');

Object.defineProperties(chatServer, {
  socketIOChatObject: {
    value: new Server(),
    writable: true,
  },
});

describe('Update Chat Message', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('message', () => {
    it('should throw an error if receiverId is empty', async () => {
      const req = chatMockRequest({}, { receiverId: '' }, authUserPayload);
      const res = chatMockResponse();
      updateChatMessage.markMessageAsRead(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"receiverId" is not allowed to be empty');
      });
    });

    it('should throw an error if receiverId is not valid mongodb ObjectId', async () => {
      const req = chatMockRequest({}, { receiverId: '12345' }, authUserPayload);
      const res = chatMockResponse();
      updateChatMessage.markMessageAsRead(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if receiverId is equal to current user id', async () => {
      const req = chatMockRequest({}, { receiverId: authUserPayload.userId }, authUserPayload);
      const res = chatMockResponse();
      updateChatMessage.markMessageAsRead(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should send correct json response from redis cache', async () => {
      const req = chatMockRequest({}, { receiverId: '60263f14648fed5246e322d8' }, authUserPayload);
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'updateChatMessages').mockResolvedValue(messageDataMock);
      jest.spyOn(chatServer.socketIOChatObject, 'emit');

      await updateChatMessage.markMessageAsRead(req, res);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('message read', messageDataMock);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('chat list', messageDataMock);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message marked as read',
      });
    });

    it('should call chatQueue addChatJob', async () => {
      const req = chatMockRequest({}, { receiverId: '60263f14648fed5246e322d8' }, authUserPayload);
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'updateChatMessages').mockResolvedValue(messageDataMock);
      jest.spyOn(chatQueue, 'addChatJob');

      await updateChatMessage.markMessageAsRead(req, res);
      expect(chatQueue.addChatJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message marked as read',
      });
    });
  });
});
