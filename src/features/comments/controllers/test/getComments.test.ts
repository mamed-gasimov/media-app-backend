import { Types } from 'mongoose';

import { authUserPayload } from '@root/mocks/auth.mock';
import {
  commentNames,
  commentsData,
  reactionMockRequest,
  reactionMockResponse,
} from '@root/mocks/reactions.mock';
import { CommentsCache } from '@service/redis/comment.cache';
import { getComments } from '@comment/controllers/getComments';
import { commentService } from '@service/db/comment.service';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/comment.cache');

describe('Get Post Comments', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('comments', () => {
    it('should throw an error if postId is not available', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '',
      });
      const res = reactionMockResponse();
      getComments.comments(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if postId is not valid mongodb ObjectId', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '12345',
      });
      const res = reactionMockResponse();
      getComments.comments(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should send correct json response if comments exist in cache', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
      });
      const res = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getPostCommentsFromCache').mockResolvedValue([commentsData]);

      await getComments.comments(req, res);
      expect(CommentsCache.prototype.getPostCommentsFromCache).toHaveBeenCalledWith(
        '6027f77087c9d9ccb1555268'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData],
      });
    });

    it('should send correct json response if comments exist in database', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
      });
      const res = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getPostCommentsFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentsFromDb').mockResolvedValue([commentsData]);

      await getComments.comments(req, res);
      expect(commentService.getPostCommentsFromDb).toHaveBeenCalledWith(
        { postId: new Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData],
      });
    });
  });

  describe('post comment names', () => {
    it('should throw an error if postId is not available', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '',
      });
      const res = reactionMockResponse();
      getComments.commentNames(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if postId is not valid mongodb ObjectId', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '12345',
      });
      const res = reactionMockResponse();
      getComments.commentNames(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should send correct json response if data exist in redis', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
      });
      const res = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getCommentsNamesFromCache').mockResolvedValue([commentNames]);

      await getComments.commentNames(req, res);
      expect(CommentsCache.prototype.getCommentsNamesFromCache).toHaveBeenCalledWith(
        '6027f77087c9d9ccb1555268'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: commentNames,
      });
    });

    it('should send correct json response if data exist in database', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
      });
      const res = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getCommentsNamesFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentNamesFromDb').mockResolvedValue([commentNames]);

      await getComments.commentNames(req, res);
      expect(commentService.getPostCommentNamesFromDb).toHaveBeenCalledWith(
        { postId: new Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: commentNames,
      });
    });

    it('should return empty comments if data does not exist in redis and database', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268',
      });
      const res = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getCommentsNamesFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentNamesFromDb').mockResolvedValue([]);

      await getComments.commentNames(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments names',
        comments: [],
      });
    });
  });

  describe('singleComment', () => {
    it('should throw an error if postId is not available', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '',
        commentId: '6064861bc25eaa5a5d2f9bf4',
      });
      const res = reactionMockResponse();
      getComments.singleComment(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if postId is not valid mongodb ObjectId', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '12345',
        commentId: '6064861bc25eaa5a5d2f9bf4',
      });
      const res = reactionMockResponse();
      getComments.singleComment(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if commentId is not available', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6064861bc25eaa5a5d2f9bf4',
        commentId: '',
      });
      const res = reactionMockResponse();
      getComments.singleComment(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if commentId is not valid mongodb ObjectId', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6064861bc25eaa5a5d2f9bf4',
        commentId: '12345',
      });
      const res = reactionMockResponse();
      getComments.singleComment(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should send correct json response from cache', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268',
      });
      const res = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getSingleCommentFromCache').mockResolvedValue([commentsData]);

      await getComments.singleComment(req, res);
      expect(CommentsCache.prototype.getSingleCommentFromCache).toHaveBeenCalledWith(
        '6027f77087c9d9ccb1555268',
        '6064861bc25eaa5a5d2f9bf4'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single comment',
        comments: commentsData,
      });
    });

    it('should send correct json response from database', async () => {
      const req = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268',
      });
      const res = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getSingleCommentFromCache').mockResolvedValue([]);
      jest.spyOn(commentService, 'getPostCommentsFromDb').mockResolvedValue([commentsData]);

      await getComments.singleComment(req, res);
      expect(commentService.getPostCommentsFromDb).toHaveBeenCalledWith(
        { _id: new Types.ObjectId('6064861bc25eaa5a5d2f9bf4') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Single comment',
        comments: commentsData,
      });
    });
  });
});
