/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';

import { CustomError } from '@global/helpers/errorHandler';
import { deletePost } from '@post/controllers/deletePost';
import { authUserPayload } from '@root/mocks/auth.mock';
import { newPost, postMockRequest, postMockResponse } from '@root/mocks/post.mock';
import { postService } from '@service/db/post.service';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import * as postServer from '@socket/post.sockets';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true,
  },
});

describe('Delete Post', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if postId is not available', async () => {
    const req = postMockRequest(newPost, authUserPayload, { postId: '' });
    const res = postMockResponse();
    deletePost.post(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if postId is not valid mongodb ObjectId', async () => {
    const req = postMockRequest(newPost, authUserPayload, { postId: '12345' });
    const res = postMockResponse();
    deletePost.post(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if post does not exist', async () => {
    const req = postMockRequest(newPost, authUserPayload, { postId: '551137c2f9e1fac808a5f572' });
    const res = postMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(null));

    deletePost.post(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Post was not found');
    });
  });

  it('should send correct json response', async () => {
    const req = postMockRequest(newPost, authUserPayload, { postId: '551137c2f9e1fac808a5f572' });
    const res = postMockResponse();

    jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve({}));

    jest.spyOn(postServer.socketIOPostObject, 'emit');
    jest.spyOn(PostCache.prototype, 'deletePostFromCache');
    jest.spyOn(postQueue, 'addPostJob');

    await deletePost.post(req, res);
    expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('delete post', req.params.postId);
    expect(PostCache.prototype.deletePostFromCache).toHaveBeenCalledWith(
      req.params.postId,
      `${req.currentUser?.userId}`
    );
    expect(postQueue.addPostJob).toHaveBeenCalledWith('deletePostFromDb', {
      keyOne: req.params.postId,
      keyTwo: req.currentUser?.userId,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post deleted successfully',
    });
  });
});
