import { Server } from 'socket.io';

import { authUserPayload } from '@root/mocks/auth.mock';
import * as chatServer from '@socket/chat.sockets';
import { chatMockRequest, chatMockResponse, mockMessageId } from '@root/mocks/chat.mock';
import { ChatCache } from '@service/redis/chat.cache';
import { chatQueue } from '@service/queues/chat.queue';
import { messageDataMock } from '@root/mocks/chat.mock';
import { addMessageReaction } from '@chat/controllers/addMessageReaction';
import { chatService } from '@service/db/chat.service';
import { IMessageData } from '@chat/interfaces/chat.interface';
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

describe('Add Message Reaction', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('message', () => {
    it('should throw an error if conversationId is empty', async () => {
      const req = chatMockRequest(
        {},
        { conversationId: '', messageId: `${mockMessageId}`, reaction: 'love', type: 'add' },
        authUserPayload
      );
      const res = chatMockResponse();
      addMessageReaction.reaction(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"conversationId" is not allowed to be empty');
      });
    });

    it('should throw an error if conversationId is not valid mongodb ObjectId', async () => {
      const req = chatMockRequest(
        {},
        { conversationId: '12345', messageId: `${mockMessageId}`, reaction: 'love', type: 'add' },
        authUserPayload
      );
      const res = chatMockResponse();
      addMessageReaction.reaction(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if messageId is empty', async () => {
      const req = chatMockRequest(
        {},
        { conversationId: '602854c81c9ca7939aaeba43', messageId: '', reaction: 'love', type: 'add' },
        authUserPayload
      );
      const res = chatMockResponse();
      addMessageReaction.reaction(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"messageId" is not allowed to be empty');
      });
    });

    it('should throw an error if messageId is not valid mongodb ObjectId', async () => {
      const req = chatMockRequest(
        {},
        { conversationId: '602854c81c9ca7939aaeba43', messageId: '12345', reaction: 'love', type: 'add' },
        authUserPayload
      );
      const res = chatMockResponse();
      addMessageReaction.reaction(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if reaction is not one of [like, love, happy, wow, sad, angry]', async () => {
      const req = chatMockRequest(
        {},
        {
          conversationId: '602854c81c9ca7939aaeba43',
          messageId: `${mockMessageId}`,
          reaction: 'test',
          type: 'add',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      addMessageReaction.reaction(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual(
          '"reaction" must be one of [like, love, happy, wow, sad, angry]'
        );
      });
    });

    it('should throw an error if type is not one of [add, remove]', async () => {
      const req = chatMockRequest(
        {},
        {
          conversationId: '602854c81c9ca7939aaeba43',
          messageId: `${mockMessageId}`,
          reaction: 'love',
          type: 'test',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      addMessageReaction.reaction(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"type" must be one of [add, remove]');
      });
    });

    it('should throw an error if message with this messageId was not found', async () => {
      const req = chatMockRequest(
        {},
        {
          conversationId: '602854c81c9ca7939aaeba43',
          messageId: `${mockMessageId}`,
          reaction: 'love',
          type: 'add',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      jest.spyOn(chatService, 'getMessageById').mockResolvedValue(null);

      addMessageReaction.reaction(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Message was not found');
      });
    });

    it('should call updateMessageReaction', async () => {
      const req = chatMockRequest(
        {},
        {
          conversationId: '602854c81c9ca7939aaeba43',
          messageId: `${mockMessageId}`,
          reaction: 'love',
          type: 'add',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      jest.spyOn(chatService, 'getMessageById').mockResolvedValue(messageDataMock as IMessageData);
      jest.spyOn(ChatCache.prototype, 'updateMessageReaction').mockResolvedValue(messageDataMock);
      jest.spyOn(chatServer.socketIOChatObject, 'emit');

      await addMessageReaction.reaction(req, res);
      expect(ChatCache.prototype.updateMessageReaction).toHaveBeenCalledWith(
        '602854c81c9ca7939aaeba43',
        `${mockMessageId}`,
        'love',
        'add',
        'sender'
      );
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(1);
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('message reaction', messageDataMock);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message reaction added',
      });
    });

    it('should call chatQueue addChatJob', async () => {
      const req = chatMockRequest(
        {},
        {
          conversationId: '602854c81c9ca7939aaeba43',
          messageId: `${mockMessageId}`,
          reaction: 'love',
          type: 'add',
        },
        authUserPayload
      );
      const res = chatMockResponse();
      jest.spyOn(chatService, 'getMessageById').mockResolvedValue(messageDataMock as IMessageData);
      jest.spyOn(chatQueue, 'addChatJob');

      await addMessageReaction.reaction(req, res);
      expect(chatQueue.addChatJob).toHaveBeenCalledWith('updateMessageReaction', {
        messageId: mockMessageId,
        senderName: req.currentUser!.username,
        reaction: 'love',
        type: 'add',
        userType: 'sender',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message reaction added',
      });
    });
  });
});
