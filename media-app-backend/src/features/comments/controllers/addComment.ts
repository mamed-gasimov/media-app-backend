import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { CommentsCache } from '@service/redis/comment.cache';
import { addCommentSchema } from '@comment/schemas/comment';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comments.interface';
import { commentQueue } from '@service/queues/comment.queue';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';
import { postService } from '@service/db/post.service';

const commentCache = new CommentsCache();

class AddComment {
  @joiValidation(addCommentSchema)
  public async comments(req: Request, res: Response) {
    const { postId, profilePicture, comment } = req.body;

    if (!Helpers.checkValidObjectId(postId)) {
      throw new BadRequestError('Invalid request.');
    }

    const existingPost = await postService.findPostById(postId);
    if (!existingPost) {
      throw new BadRequestError('Post was not found');
    }

    const commentObjectId = new ObjectId();

    const commentData = {
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date(),
    } as ICommentDocument;

    await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));
    const databaseCommentData: ICommentJob = {
      postId,
      userTo: existingPost.userId,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData,
    };
    commentQueue.addPostCommentJob('addCommentToDB', databaseCommentData);

    res.status(HTTP_STATUS.OK).json({ message: 'Comment added successfully.' });
  }
}

export const addComment = new AddComment();
