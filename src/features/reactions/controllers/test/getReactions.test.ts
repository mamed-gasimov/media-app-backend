/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';

import { authUserPayload } from '@root/mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse, reactionData } from '@root/mocks/reactions.mock';
import { reactionService } from '@service/db/reaction.service';
import { ReactionsCache } from '@service/redis/reaction.cache';
import { getReactions } from '@reaction/controllers/getReactions';
import { postMockData } from '@root/mocks/post.mock';
import { postService } from '@service/db/post.service';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');

describe('Get Reactions', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('reactions', () => {
    it('should throw an error if postId is not available', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '',
      });
      const res = reactionMockResponse();
      getReactions.reactions(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if postId is not valid mongodb ObjectId', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '12345',
      });
      const res = reactionMockResponse();
      getReactions.reactions(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if post does not exist', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
      });
      const res = reactionMockResponse();

      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(null));

      getReactions.reactions(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Post was not found');
      });
    });

    it('should send correct json response if reactions exist in cache', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
      });
      const res = reactionMockResponse();
      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
      jest.spyOn(ReactionsCache.prototype, 'getReactionsFromCache').mockResolvedValue([reactionData]);

      await getReactions.reactions(req, res);
      expect(ReactionsCache.prototype.getReactionsFromCache).toHaveBeenCalledWith(`${postMockData._id}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
      });
      const res = reactionMockResponse();
      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
      jest.spyOn(ReactionsCache.prototype, 'getReactionsFromCache').mockResolvedValue([]);
      jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([reactionData]);

      await getReactions.reactions(req, res);
      expect(reactionService.getPostReactions).toHaveBeenCalledWith(
        { postId: new Types.ObjectId(`${postMockData._id}`) },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
      });
      const res = reactionMockResponse();
      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
      jest.spyOn(ReactionsCache.prototype, 'getReactionsFromCache').mockResolvedValue([]);
      jest.spyOn(reactionService, 'getPostReactions').mockResolvedValue([]);

      await getReactions.reactions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [],
      });
    });
  });

  describe('singleReactionByUsername', () => {
    it('should send correct json response if reaction exists in cache', async () => {
      const req = reactionMockRequest(
        {},
        {
          postId: `${postMockData._id}`,
          username: postMockData.username,
        },
        authUserPayload
      );
      const res = reactionMockResponse();
      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
      jest.spyOn(ReactionsCache.prototype, 'getSingleReactionFromCache').mockResolvedValue(reactionData);

      await getReactions.singleReactionByUsername(req, res);
      expect(ReactionsCache.prototype.getSingleReactionFromCache).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postMockData.username
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: reactionData,
      });
    });

    it('should send correct json response if reaction exists in database', async () => {
      const req = reactionMockRequest(
        {},
        {
          postId: `${postMockData._id}`,
          username: postMockData.username,
        },
        authUserPayload
      );
      const res = reactionMockResponse();
      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
      jest.spyOn(ReactionsCache.prototype, 'getSingleReactionFromCache').mockResolvedValue(undefined);
      jest.spyOn(reactionService, 'getSinglePostReactionByUsername').mockResolvedValue(reactionData);

      await getReactions.singleReactionByUsername(req, res);
      expect(reactionService.getSinglePostReactionByUsername).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postMockData.username
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: reactionData,
      });
    });

    it('should send correct json response if reaction is empty', async () => {
      const req = reactionMockRequest(
        {},
        {
          postId: `${postMockData._id}`,
          username: postMockData.username,
        },
        authUserPayload
      );
      const res = reactionMockResponse();
      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
      jest.spyOn(ReactionsCache.prototype, 'getSingleReactionFromCache').mockResolvedValue(undefined);
      jest.spyOn(reactionService, 'getSinglePostReactionByUsername').mockResolvedValue(undefined);

      await getReactions.singleReactionByUsername(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single post reaction by username',
        reactions: {},
      });
    });
  });

  describe('reactionsByUsername', () => {
    it('should throw an error if username is not available', async () => {
      const req = reactionMockRequest({}, { username: '' }, authUserPayload);
      const res = reactionMockResponse();
      getReactions.reactionsByUsername(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('"username" is not allowed to be empty');
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req = reactionMockRequest({}, { username: postMockData.username }, authUserPayload);
      const res = reactionMockResponse();
      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue([reactionData]);

      await getReactions.reactionsByUsername(req, res);
      expect(reactionService.getReactionsByUsername).toHaveBeenCalledWith(postMockData.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All user reactions by username',
        reactions: [reactionData],
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req = reactionMockRequest({}, { username: postMockData.username }, authUserPayload);
      const res = reactionMockResponse();
      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
      jest.spyOn(reactionService, 'getReactionsByUsername').mockResolvedValue([]);

      await getReactions.reactionsByUsername(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All user reactions by username',
        reactions: [],
      });
    });
  });
});
