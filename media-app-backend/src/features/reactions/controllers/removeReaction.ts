import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { IReactionJob, ReactionType } from '@reaction/interfaces/reaction.interface';
import { removeReactionSchema } from '@reaction/schemas/reactions';
import { postService } from '@service/db/post.service';
import { ReactionsCache } from '@service/redis/reaction.cache';
import { reactionQueue } from '@service/queues/reaction.queue';

const reactionCache = new ReactionsCache();

class RemoveReactions {
  @joiValidation(removeReactionSchema)
  public async reactions(req: Request, res: Response) {
    const { postId } = req.body;

    if (!Helpers.checkValidObjectId(postId)) {
      throw new BadRequestError('Invalid request.');
    }

    const existingPost = await postService.findPostById(postId);
    if (!existingPost) {
      throw new BadRequestError('Post was not found');
    }

    const previousReaction: ReactionType = req.body.previousReaction;
    if (existingPost.reactions && existingPost.reactions[previousReaction] === 0) {
      throw new BadRequestError('Reaction count for post reactions must be positive integer');
    }

    await reactionCache.removePostReactionFromCache(postId, `${req.currentUser!.username}`, previousReaction);

    const reactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      previousReaction,
    };

    reactionQueue.addReactionJob('removeReactionDataFromDb', reactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post successfully.' });
  }
}

export const removeReactions = new RemoveReactions();
