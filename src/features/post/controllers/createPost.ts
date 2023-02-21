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
import { imageQueue } from '@service/queues/image.queue';

const postCache = new PostCache();

class CreatePost {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response) {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;

    let result: UploadApiResponse | UploadApiErrorResponse | undefined;
    if (image) {
      result = await uploads(image);
      if (!result?.public_id) {
        throw new BadRequestError(result?.message);
      }
    }

    const postObjectId = new ObjectId();
    const createdPost = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      post,
      bgColor,
      privacy,
      gifUrl,
      profilePicture,
      feelings,
      commentsCount: 0,
      imgVersion: `${result?.version || ''}`,
      imgId: `${result?.public_id || ''}`,
      videoId: '',
      videoVersion: '',
      createdAt: new Date(),
      updatedAt: null,
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 },
    } as IPostDocument;

    socketIOPostObject.emit('add post', createdPost);

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser?.userId}`,
      uId: `${req.currentUser?.uId}`,
      createdPost,
    });

    postQueue.addPostJob('addPostToDb', { key: req.currentUser!.userId, value: createdPost });

    if (result?.version && result?.public_id) {
      imageQueue.addImageJob('addImageToDb', {
        key: `${req.currentUser!.userId}`,
        imgId: result.public_id,
        imgVersion: result.version.toString(),
      });
    }

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }
}

export const createPost = new CreatePost();
