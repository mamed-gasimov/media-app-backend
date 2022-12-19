import { Request, Response } from 'express';
import { Types } from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { postService } from '@service/db/post.service';
import { ReactionsCache } from '@service/redis/reaction.cache';
import { reactionService } from '@service/db/reaction.service';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { reactionsByUsernameSchema, singleReactionByUsernameSchema } from '@reaction/schemas/reactions';

const reactionCache = new ReactionsCache();

class GetReactions {
  public async reactions(req: Request, res: Response) {
    const { postId } = req.params;

    if (!Helpers.checkValidObjectId(postId)) {
      throw new BadRequestError('Invalid request.');
    }

    const existingPost = await postService.findPostById(postId);
    if (!existingPost) {
      throw new BadRequestError('Post was not found');
    }

    const cachedReactions = await reactionCache.getReactionsFromCache(postId);
    const reactions = cachedReactions.length
      ? cachedReactions
      : await reactionService.getPostReactions({ postId: new Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post reactions', reactions });
  }

  @joiValidation(singleReactionByUsernameSchema)
  public async singleReactionByUsername(req: Request, res: Response) {
    const { postId, username } = req.body;

    if (!Helpers.checkValidObjectId(postId)) {
      throw new BadRequestError('Invalid request.');
    }

    const existingPost = await postService.findPostById(postId);
    if (!existingPost) {
      throw new BadRequestError('Post was not found');
    }

    const cachedReaction = await reactionCache.getSingleReactionFromCache(postId, username);
    const reaction = cachedReaction
      ? cachedReaction
      : await reactionService.getSinglePostReactionByUsername(postId, username);

    res.status(HTTP_STATUS.OK).json({
      message: 'Single post reaction by username',
      reactions: reaction || {},
    });
  }

  @joiValidation(reactionsByUsernameSchema)
  public async reactionsByUsername(req: Request, res: Response) {
    const { username } = req.body;
    const reactions = await reactionService.getReactionsByUsername(username);
    res.status(HTTP_STATUS.OK).json({ message: 'All user reactions by username', reactions });
  }
}

export const getReactions = new GetReactions();
