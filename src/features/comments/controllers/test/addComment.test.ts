/* eslint-disable @typescript-eslint/no-explicit-any */
import { authUserPayload } from '@root/mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse } from '@root/mocks/reactions.mock';
import { CommentsCache } from '@service/redis/comment.cache';
import { commentQueue } from '@service/queues/comment.queue';
import { addComment } from '@comment/controllers/addComment';
import { CustomError } from '@global/helpers/errorHandler';
import { postService } from '@service/db/post.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/comment.cache');

describe('Add Post Comment', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if postId is not available', async () => {
    const req = reactionMockRequest(
      {},
      {
        postId: '',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
      },
      authUserPayload
    );
    const res = reactionMockResponse();
    addComment.comments(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"postId" is not allowed to be empty');
    });
  });

  it('should throw an error if postId is not valid mongodb ObjectId', async () => {
    const req = reactionMockRequest(
      {},
      {
        postId: '12345',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
      },
      authUserPayload
    );
    const res = reactionMockResponse();
    addComment.comments(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if comment is not available', async () => {
    const req = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: '',
        profilePicture: 'https://place-hold.it/500x500',
      },
      authUserPayload
    );
    const res = reactionMockResponse();
    addComment.comments(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"comment" is not allowed to be empty');
    });
  });

  it('should throw an error if post does not exist', async () => {
    const req = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
      },
      authUserPayload
    );
    const res = reactionMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(null));

    addComment.comments(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Post was not found');
    });
  });

  it('should call savePostCommentToCache and addCommentJob methods', async () => {
    const req = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
      },
      authUserPayload
    );
    const res = reactionMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
    jest.spyOn(CommentsCache.prototype, 'savePostCommentToCache');
    jest.spyOn(commentQueue, 'addPostCommentJob');

    await addComment.comments(req, res);
    expect(CommentsCache.prototype.savePostCommentToCache).toHaveBeenCalled();
    expect(commentQueue.addPostCommentJob).toHaveBeenCalled();
  });

  it('should send correct json response', async () => {
    const req = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
      },
      authUserPayload
    );
    const res = reactionMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
    await addComment.comments(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Comment added successfully.',
    });
  });
});
