import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { uploads } from '@global/helpers/cloudinaryUpload';
import { BadRequestError } from '@global/helpers/errorHandler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema } from '@post/schemas/post';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.sockets';

const postCache = new PostCache();

class UpdatePost {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response) {
    const { postId } = req.params;
    if (!postId || !ObjectId.isValid(postId)) {
      throw new BadRequestError('Invalid request.');
    }

    const objectId = new ObjectId(postId);
    if (String(objectId) !== postId) {
      throw new BadRequestError('Invalid request.');
    }

    const {
      post,
      bgColor,
      imgId,
      imgVersion,
      videoId,
      videoVersion,
      feelings,
      gifUrl,
      privacy,
      profilePicture,
      image,
    } = req.body;

    let result: UploadApiResponse | UploadApiErrorResponse | undefined;
    if (image) {
      result = await uploads(image);
      if (!result?.public_id) {
        throw new BadRequestError(result?.message);
      }
    }

    const updatedPostData = {
      post,
      bgColor,
      imgVersion: `${result?.version || imgVersion}`,
      imgId: `${result?.public_id || imgId}`,
      videoId,
      videoVersion,
      feelings,
      gifUrl,
      privacy,
      profilePicture,
    } as IPostDocument;

    const postUpdated = await postCache.updatePostInCache(postId, updatedPostData);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDb', { key: postId, value: postUpdated });
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }
}

export const updatePost = new UpdatePost();
