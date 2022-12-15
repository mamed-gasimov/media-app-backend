import { omit } from 'lodash';

import { IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.model';
import { UserCache } from '@service/redis/user.cache';
import { PostModel } from '@post/models/post.model';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IPostDocument } from '@post/interfaces/post.interface';

const userCache = new UserCache();

class ReactionService {
  public async addReactionDataToDb(reactionData: IReactionJob) {
    const { postId, previousReaction, username, reactionObject, type, userFrom, userTo } = reactionData;
    let updatedReactionObject = reactionObject as IReactionDocument;
    if (previousReaction) {
      updatedReactionObject = omit(reactionObject, ['_id']);
    }

    const updatedReaction = (await Promise.all([
      userCache.getUserFromCache(`${userTo}`),
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, { upsert: true }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1,
          },
        },
        { new: true }
      ),
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument];
  }

  public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
          },
        },
        { new: true }
      ),
    ]);
  }
}

export const reactionService = new ReactionService();
