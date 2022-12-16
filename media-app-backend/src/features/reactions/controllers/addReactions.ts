import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { IReactionDocument, IReactionJob, ReactionType } from '@reaction/interfaces/reaction.interface';
import { addReactionSchema } from '@reaction/schemas/reactions';
import { postService } from '@service/db/post.service';
import { userService } from '@service/db/user.service';
import { ReactionsCache } from '@service/redis/reaction.cache';
import { reactionQueue } from '@service/queues/reaction.queue';

const reactionCache = new ReactionsCache();

class AddReactions {
  @joiValidation(addReactionSchema)
  public async reactions(req: Request, res: Response) {
    const { userTo, postId } = req.body;

    if (!Helpers.checkValidObjectId(postId) || !Helpers.checkValidObjectId(userTo)) {
      throw new BadRequestError('Invalid request.');
    }

    const existingPost = await postService.findPostById(postId);
    if (!existingPost) {
      throw new BadRequestError('Post was not found');
    }

    const existingUser = await userService.findUserById(userTo);
    if (!existingUser) {
      throw new BadRequestError('User was not found');
    }

    const { type, profilePicture } = req.body;
    const previousReaction: ReactionType = req.body.previousReaction;

    if (previousReaction && existingPost.reactions && existingPost.reactions[previousReaction] === 0) {
      throw new BadRequestError('Reaction count for post reactions must be positive integer');
    }

    const reactionObject = {
      _id: new ObjectId(),
      avataColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username,
      postId,
      type,
      profilePicture,
      userTo,
    } as IReactionDocument;

    await reactionCache.savePostReactionToCache(postId, reactionObject, type, previousReaction);

    const databaseReactionData: IReactionJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      type,
      previousReaction,
      reactionObject,
    };
    reactionQueue.addReactionJob('addReactionDataToDb', databaseReactionData);

    res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully.' });
  }
}

export const addReactions = new AddReactions();
