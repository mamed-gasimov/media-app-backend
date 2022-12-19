/* eslint-disable @typescript-eslint/no-explicit-any */
import { authUserPayload } from '@root/mocks/auth.mock';
import { reactionMock, reactionMockRequest, reactionMockResponse } from '@root/mocks/reactions.mock';
import { ReactionsCache } from '@service/redis/reaction.cache';
import { reactionQueue } from '@service/queues/reaction.queue';
import { addReactions } from '@reaction/controllers/addReactions';
import { CustomError } from '@global/helpers/errorHandler';
import { postService } from '@service/db/post.service';
import { userService } from '@service/db/user.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/reaction.cache');

describe('Add reaction to post', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if reaction type is not available', async () => {
    const req = reactionMockRequest({}, { ...reactionMock, type: '' }, authUserPayload);
    const res = reactionMockResponse();
    addReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"type" must be one of [like, love, happy, wow, sad, angry]');
    });
  });

  it('should throw an error if reaction type is not one of [like, love, happy, wow, sad, angry]', async () => {
    const req = reactionMockRequest({}, { ...reactionMock, type: 'random word' }, authUserPayload);
    const res = reactionMockResponse();
    addReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"type" must be one of [like, love, happy, wow, sad, angry]');
    });
  });

  it('should throw an error if previousReaction is not one of [like, love, happy, wow, sad, angry, null, ]', async () => {
    const req = reactionMockRequest({}, { ...reactionMock, previousReaction: 'random word' }, authUserPayload);
    const res = reactionMockResponse();
    addReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        '"previousReaction" must be one of [like, love, happy, wow, sad, angry, null, ]'
      );
    });
  });

  it('should throw an error if postId is not available', async () => {
    const req = reactionMockRequest({}, { ...reactionMock, postId: '' }, authUserPayload);
    const res = reactionMockResponse();
    addReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"postId" is not allowed to be empty');
    });
  });

  it('should throw an error if userTo is not available', async () => {
    const req = reactionMockRequest({}, { ...reactionMock, userTo: '' }, authUserPayload);
    const res = reactionMockResponse();
    addReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('"userTo" is not allowed to be empty');
    });
  });

  it('should throw an error if postId is not valid mongodb ObjectId', async () => {
    const req = reactionMockRequest({}, { ...reactionMock, postId: '12345' }, authUserPayload);
    const res = reactionMockResponse();
    addReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if userTo is not valid mongodb ObjectId', async () => {
    const req = reactionMockRequest({}, { ...reactionMock, userTo: '12345' }, authUserPayload);
    const res = reactionMockResponse();
    addReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if post does not exist', async () => {
    const req = reactionMockRequest({}, reactionMock, authUserPayload);
    const res = reactionMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(null));

    addReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Post was not found');
    });
  });

  it('should throw an error if user does not exist', async () => {
    const req = reactionMockRequest({}, reactionMock, authUserPayload);
    const res = reactionMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
    jest.spyOn(userService, 'findUserById').mockImplementation((): any => Promise.resolve(null));

    addReactions.reactions(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('User was not found');
    });
  });

  it('should send correct json response', async () => {
    const req = reactionMockRequest({}, reactionMock, authUserPayload);
    const res = reactionMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));
    jest.spyOn(userService, 'findUserById').mockImplementation((): any => Promise.resolve({}));

    const spy = jest.spyOn(ReactionsCache.prototype, 'savePostReactionToCache');
    const reactionSpy = jest.spyOn(reactionQueue, 'addReactionJob');

    await addReactions.reactions(req, res);
    expect(ReactionsCache.prototype.savePostReactionToCache).toHaveBeenCalledWith(
      spy.mock.calls[0][0],
      spy.mock.calls[0][1],
      spy.mock.calls[0][2],
      spy.mock.calls[0][3]
    );
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(
      reactionSpy.mock.calls[0][0],
      reactionSpy.mock.calls[0][1]
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction added successfully.',
    });
  });
});
