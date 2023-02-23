import { Types } from 'mongoose';
import { Server } from 'socket.io';

import { authUserPayload } from '@root/mocks/auth.mock';
import { deleteChatMessage } from '@chat/controllers/deleteChatMessage';
import * as chatServer from '@socket/chat.sockets';
import { chatMockRequest, chatMockResponse, mockMessageId } from '@root/mocks/chat.mock';
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

describe('Delete Chat Message', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('markMessageAsDeleted', () => {
    it('should throw an error if receiverId is not sent', async () => {
      const req = chatMockRequest(
        {},
        {
          messageId: `${mockMessageId}`,
          type: 'deleteForMe',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      deleteChatMessage.markMessageAsDeleted(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"receiverId" is required');
      });
    });

    it('should throw an error if receiverId is empty', async () => {
      const req = chatMockRequest(
        {},
        {
          receiverId: '',
          messageId: `${mockMessageId}`,
          type: 'deleteForMe',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      deleteChatMessage.markMessageAsDeleted(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"receiverId" is not allowed to be empty');
      });
    });

    it('should throw an error if receiverId is not valid mongodb ObjectId', async () => {
      const req = chatMockRequest(
        {},
        {
          receiverId: '12345',
          messageId: `${mockMessageId}`,
          type: 'deleteForMe',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      deleteChatMessage.markMessageAsDeleted(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if messageId is empty', async () => {
      const req = chatMockRequest(
        {},
        {
          receiverId: '60263f14648fed5246e322d8',
          messageId: '',
          type: 'deleteForMe',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      deleteChatMessage.markMessageAsDeleted(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"messageId" is not allowed to be empty');
      });
    });

    it('should throw an error if messageId is not valid mongodb ObjectId', async () => {
      const req = chatMockRequest(
        {},
        {
          receiverId: '60263f14648fed5246e322d8',
          messageId: '12345',
          type: 'deleteForMe',
        },
        authUserPayload,
        {
          receiverId: '12345',
        }
      );
      const res = chatMockResponse();
      deleteChatMessage.markMessageAsDeleted(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if type is not sent', async () => {
      const req = chatMockRequest(
        {},
        {
          receiverId: '60263f14648fed5246e322d8',
          messageId: `${mockMessageId}`,
        },
        authUserPayload
      );
      const res = chatMockResponse();
      deleteChatMessage.markMessageAsDeleted(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"type" is required');
      });
    });

    it('should throw an error if type is nether "deleteForMe" nor "deleteForEveryone"', async () => {
      const req = chatMockRequest(
        {},
        {
          receiverId: '60263f14648fed5246e322d8',
          messageId: `${mockMessageId}`,
          type: 'test',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      deleteChatMessage.markMessageAsDeleted(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual(
          '"type" must be one of [deleteForMe, deleteForEveryone]'
        );
      });
    });

    it('should throw an error if receiverId is equal to current user id', async () => {
      const req = chatMockRequest(
        {},
        {
          receiverId: authUserPayload.userId,
          messageId: `${mockMessageId}`,
          type: 'deleteForMe',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      deleteChatMessage.markMessageAsDeleted(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should send correct json response (deleteForMe)', async () => {
      const req = chatMockRequest(
        {},
        {
          receiverId: '60263f14648fed5246e322d8',
          messageId: `${mockMessageId}`,
          type: 'deleteForMe',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'markMessageAsDeleted').mockResolvedValue(messageDataMock);
      jest.spyOn(chatServer.socketIOChatObject, 'emit');
      jest.spyOn(chatQueue, 'addChatJob');

      await deleteChatMessage.markMessageAsDeleted(req, res);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('message read', messageDataMock);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('chat list', messageDataMock);
      expect(chatQueue.addChatJob).toHaveBeenCalledWith('markMessageAsDeletedInDb', {
        messageId: new Types.ObjectId(mockMessageId),
        type: 'deleteForMe',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message marked as deleted',
      });
    });

    it('should send correct json response (deleteForEveryone)', async () => {
      const req = chatMockRequest(
        {},
        {
          receiverId: '60263f14648fed5246e322d8',
          messageId: `${mockMessageId}`,
          type: 'deleteForEveryone',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'markMessageAsDeleted').mockResolvedValue(messageDataMock);
      jest.spyOn(chatServer.socketIOChatObject, 'emit');
      jest.spyOn(chatQueue, 'addChatJob');

      await deleteChatMessage.markMessageAsDeleted(req, res);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('message read', messageDataMock);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('chat list', messageDataMock);
      expect(chatQueue.addChatJob).toHaveBeenCalledWith('markMessageAsDeletedInDb', {
        messageId: new Types.ObjectId(mockMessageId),
        type: 'deleteForEveryone',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message was deleted',
      });
    });
  });
});
