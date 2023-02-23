/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';

import * as cloudinaryUploads from '@global/helpers/cloudinaryUpload';
import { CustomError } from '@global/helpers/errorHandler';
import { updatePost } from '@post/controllers/updatePost';
import { authUserPayload } from '@root/mocks/auth.mock';
import {
  postMockData,
  postMockRequest,
  postMockResponse,
  updatedPost,
  updatedPostWithImage,
} from '@root/mocks/post.mock';
import { postService } from '@service/db/post.service';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import * as postServer from '@socket/post.sockets';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');
jest.mock('@global/helpers/cloudinaryUpload');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true,
  },
});

describe('Update Post', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('post without image', () => {
    it('should send correct json response', async () => {
      const req = postMockRequest(updatedPost, authUserPayload, { postId: `${postMockData._id}` });
      const res = postMockResponse();

      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(postMockData));

      const postSpy = jest.spyOn(PostCache.prototype, 'updatePostInCache').mockResolvedValue(postMockData);
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await updatePost.post(req, res);
      expect(postSpy).toHaveBeenCalledWith(`${postMockData._id}`, updatedPost);
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDb', {
        key: `${postMockData._id}`,
        value: postMockData,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully',
      });
    });

    it('should throw an error if postId is not available', async () => {
      const req = postMockRequest(updatedPost, authUserPayload, { postId: '' });
      const res = postMockResponse();
      updatePost.post(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if postId is not valid mongodb ObjectId', async () => {
      const req = postMockRequest(updatedPost, authUserPayload, { postId: '12345' });
      const res = postMockResponse();
      updatePost.post(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid request.');
      });
    });

    it('should throw an error if post does not exist', async () => {
      const req = postMockRequest(updatedPost, authUserPayload, { postId: '551137c2f9e1fac808a5f572' });
      const res = postMockResponse();

      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(null));

      updatePost.post(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Post was not found');
      });
    });
  });

  describe('post with image', () => {
    it('should throw an upload error if image is not valid', () => {
      updatedPostWithImage.image = 'some invalid string';
      const req = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` });
      const res = postMockResponse();

      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(postMockData));
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any =>
          Promise.resolve({ version: '', public_id: '', message: 'Upload error' })
        );

      updatePost.post(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Upload error');
      });
    });

    it('should send correct json response if post had image before', async () => {
      postMockData.imgId = '1234';
      postMockData.imgVersion = '1234';
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` });
      const res = postMockResponse();

      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(postMockData));

      const postSpy = jest.spyOn(PostCache.prototype, 'updatePostInCache');
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      await updatePost.post(req, res);
      expect(PostCache.prototype.updatePostInCache).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postSpy.mock.calls[0][1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully',
      });
    });

    it('should send correct json response if post did not have image before', async () => {
      postMockData.imgId = '';
      postMockData.imgVersion = '';
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` });
      const res = postMockResponse();

      jest.spyOn(postService, 'findPostById').mockImplementation((): any => Promise.resolve(postMockData));

      const postSpy = jest.spyOn(PostCache.prototype, 'updatePostInCache');
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      await updatePost.post(req, res);
      expect(PostCache.prototype.updatePostInCache).toHaveBeenCalledWith(
        `${postMockData._id}`,
        postSpy.mock.calls[0][1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully',
      });
    });
  });
});
