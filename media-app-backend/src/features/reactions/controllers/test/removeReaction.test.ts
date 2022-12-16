/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactionMockRequest, reactionMockResponse, removeReactionMock } from '@root/mocks/reactions.mock';
import { authUserPayload } from '@root/mocks/auth.mock';
import { ReactionsCache } from '@service/redis/reaction.cache';
import { reactionQueue } from '@service/queues/reaction.queue';
import { removeReactions } from '@reaction/controllers/removeReaction';
import { postService } from '@service/db/post.service';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');

describe('Remove reaction from post', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if postId is not available', async () => {
    const req = reactionMockRequest({}, { ...removeReactionMock, postId: '' }, authUserPayload);
    const res = reactionMockResponse();
    removeReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"postId" is not allowed to be empty');
    });
  });

  it('should throw an error if postId is not valid mongodb ObjectId', async () => {
    const req = reactionMockRequest({}, { ...removeReactionMock, postId: '12345' }, authUserPayload);
    const res = reactionMockResponse();
    removeReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if post does not exist', async () => {
    const req = reactionMockRequest({}, removeReactionMock, authUserPayload);
    const res = reactionMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(null));

    removeReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Post was not found');
    });
  });

  it('should throw an error if previousReaction is not one of [like, love, happy, wow, sad, angry]', async () => {
    const req = reactionMockRequest({}, { ...removeReactionMock, previousReaction: 'random word' }, authUserPayload);
    const res = reactionMockResponse();
    removeReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        '"previousReaction" must be one of [like, love, happy, wow, sad, angry]'
      );
    });
  });

  it('should throw an error if postReactions is not available', async () => {
    const req = reactionMockRequest({}, { ...removeReactionMock, postReactions: undefined }, authUserPayload);
    const res = reactionMockResponse();
    removeReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"postReactions" is required');
    });
  });

  it('should throw an error if postReactions object does not have like property', async () => {
    const req = reactionMockRequest(
      {},
      { ...removeReactionMock, postReactions: { ...removeReactionMock.postReactions, like: undefined } },
      authUserPayload
    );
    const res = reactionMockResponse();
    removeReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"postReactions.like" is required');
    });
  });

  it('should send correct json response', async () => {
    const req = reactionMockRequest({}, removeReactionMock, authUserPayload);
    const res = reactionMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));

    jest.spyOn(ReactionsCache.prototype, 'removePostReactionFromCache');
    const spy = jest.spyOn(reactionQueue, 'addReactionJob');

    await removeReactions.reactions(req, res);
    expect(ReactionsCache.prototype.removePostReactionFromCache).toHaveBeenCalledWith(
      '6027f77087c9d9ccb1555268',
      `${req.currentUser?.username}`,
      req.body?.postReactions
    );
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction removed from post successfully.',
    });
  });
});
