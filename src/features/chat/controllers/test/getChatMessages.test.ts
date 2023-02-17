import { authUserPayload } from '@root/mocks/auth.mock';
import { chatMessage, chatMockRequest, chatMockResponse, messageDataMock } from '@root/mocks/chat.mock';
import { ChatCache } from '@service/redis/chat.cache';
import { getChatMessages } from '@chat/controllers/getChatMessages';
import { chatService } from '@service/db/chat.service';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/chat.cache');

describe('Get Chat Messages', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('conversationList', () => {
    it('should send correct json response if chat list exist in redis', async () => {
      const req = chatMockRequest({}, {}, authUserPayload);
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'getUserConversationList').mockResolvedValue([messageDataMock]);

      await getChatMessages.conversationList(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User conversation list',
        list: [messageDataMock],
      });
    });

    it('should send correct json response if no chat list response from redis', async () => {
      const req = chatMockRequest({}, {}, authUserPayload);
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'getUserConversationList').mockResolvedValue([]);
      jest.spyOn(chatService, 'getUserConversationList').mockResolvedValue([messageDataMock]);

      await getChatMessages.conversationList(req, res);
      expect(chatService.getUserConversationList).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User conversation list',
        list: [messageDataMock],
      });
    });

    it('should send correct json response with empty chat list if it does not exist (redis & database)', async () => {
      const req = chatMockRequest({}, chatMessage, authUserPayload);
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'getUserConversationList').mockResolvedValue([]);
      jest.spyOn(chatService, 'getUserConversationList').mockResolvedValue([]);

      await getChatMessages.conversationList(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User conversation list',
        list: [],
      });
    });
  });

  describe('messages', () => {
    it('should throw an error if receiverId is not available', async () => {
      const req = chatMockRequest({}, chatMessage, authUserPayload, {});
      const res = chatMockResponse();
      getChatMessages.messages(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if receiverId is not valid mongodb ObjectId', async () => {
      const req = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '12345',
      });
      const res = chatMockResponse();
      getChatMessages.messages(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if receiverId is equal to current user id', async () => {
      const req = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: authUserPayload.userId,
      });
      const res = chatMockResponse();
      getChatMessages.messages(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should send correct json response if chat messages exist in redis', async () => {
      const req = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '60263f14648fed5246e322d8',
      });
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'getChatMessagesFromCache').mockResolvedValue([messageDataMock]);

      await getChatMessages.messages(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat messages',
        messages: [messageDataMock],
      });
    });

    it('should send correct json response if no chat message response from redis', async () => {
      const req = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '60263f14648fed5246e322d8',
      });
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'getChatMessagesFromCache').mockResolvedValue([]);
      jest.spyOn(chatService, 'getMessages').mockResolvedValue([messageDataMock]);

      await getChatMessages.messages(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat messages',
        messages: [messageDataMock],
      });
    });

    it('should send correct json response with empty chat messages if it does not exist (redis & database)', async () => {
      const req = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '6064793b091bf02b6a71067a',
      });
      const res = chatMockResponse();
      jest.spyOn(ChatCache.prototype, 'getChatMessagesFromCache').mockResolvedValue([]);
      jest.spyOn(chatService, 'getMessages').mockResolvedValue([]);

      await getChatMessages.messages(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User chat messages',
        messages: [],
      });
    });
  });
});
