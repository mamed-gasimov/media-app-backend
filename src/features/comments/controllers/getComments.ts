import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { Types } from 'mongoose';

import { CommentsCache } from '@service/redis/comment.cache';
import { commentService } from '@service/db/comment.service';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';

const commentsCache = new CommentsCache();

class GetComments {
  public async comments(req: Request, res: Response) {
    const { postId } = req.params;

    if (!Helpers.checkValidObjectId(postId)) {
      throw new BadRequestError('Invalid request.');
    }

    const cachedComments = await commentsCache.getPostCommentsFromCache(postId);
    const comments = cachedComments.length
      ? cachedComments
      : await commentService.getPostCommentsFromDb({ postId: new Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
  }

  public async commentNames(req: Request, res: Response) {
    const { postId } = req.params;

    if (!Helpers.checkValidObjectId(postId)) {
      throw new BadRequestError('Invalid request.');
    }

    const cachedCommentsNames = await commentsCache.getCommentsNamesFromCache(postId);
    const commentsNames = cachedCommentsNames.length
      ? cachedCommentsNames
      : await commentService.getPostCommentNamesFromDb(
          { postId: new Types.ObjectId(postId) },
          { createdAt: -1 }
        );

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Post comments names', comments: commentsNames.length ? commentsNames[0] : [] });
  }

  public async singleComment(req: Request, res: Response) {
    const { postId, commentId } = req.params;

    if (!Helpers.checkValidObjectId(postId) || !Helpers.checkValidObjectId(commentId)) {
      throw new BadRequestError('Invalid request.');
    }

    const cachedComments = await commentsCache.getSingleCommentFromCache(postId, commentId);
    const comments = cachedComments.length
      ? cachedComments
      : await commentService.getPostCommentsFromDb({ _id: new Types.ObjectId(commentId) }, { createdAt: -1 });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Single comment', comments: comments.length ? comments[0] : [] });
  }
}

export const getComments = new GetComments();
