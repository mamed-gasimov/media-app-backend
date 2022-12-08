import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema } from '@post/schemas/post';

class CreatePost {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response) {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;
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
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 },
    } as IPostDocument;

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }
}

export const createPost = new CreatePost();
