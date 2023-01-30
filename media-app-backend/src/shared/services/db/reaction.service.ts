import { omit } from 'lodash';
import { Types } from 'mongoose';

import { IQueryReaction, IReactionDocument, IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ReactionModel } from '@reaction/models/reaction.model';
import { UserCache } from '@service/redis/user.cache';
import { PostModel } from '@post/models/post.model';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IPostDocument } from '@post/interfaces/post.interface';
import { Helpers } from '@global/helpers/helpers';
import { NotificationModel } from '@notification/models/notification.model';
import { socketIONotificationObject } from '@socket/notification.sockets';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';
import { notificationTemplate } from '@service/emails/templates/notifications/notificationTemplate';
import { emailQueue } from '@service/queues/email.queue';

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
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, {
        upsert: true,
      }),
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

    if (updatedReaction[0].notifications.reactions && userTo !== userFrom) {
      const notificationModel = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userFrom as string,
        userTo: userTo as string,
        message: `${username} reacted to your post.`,
        notificationType: 'reactions',
        entityId: new Types.ObjectId(postId),
        createdItemId: new Types.ObjectId(updatedReaction[1]._id!),
        createdAt: new Date(),
        comment: '',
        post: updatedReaction[2].post,
        imgId: updatedReaction[2].imgId!,
        imgVersion: updatedReaction[2].imgVersion!,
        gifUrl: updatedReaction[2].gifUrl!,
        reaction: type!,
      });

      socketIONotificationObject.emit('insert notification', notifications, { userTo });
      const templateParams: INotificationTemplate = {
        username: updatedReaction[0].username!,
        message: `${username} reacted to your post.`,
        header: 'Post Reaction Notification',
      };

      const template = notificationTemplate.notificationMessageTemplate(templateParams);
      emailQueue.addEmailJob('reactionsEmail', {
        receiverEmail: updatedReaction[0].email!,
        template,
        subject: 'Post reaction notification',
      });
    }
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

  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>) {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: query },
      { $sort: sort },
    ]);
    return reactions;
  }

  public async getSinglePostReactionByUsername(
    postId: string,
    username: string
  ): Promise<IReactionDocument | undefined> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { postId: new Types.ObjectId(postId), username: Helpers.firstLetterUpperCase(username) } },
    ]);
    return reactions?.[0];
  }

  public async getReactionsByUsername(username: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { username: Helpers.firstLetterUpperCase(username) } },
    ]);
    return reactions;
  }
}

export const reactionService = new ReactionService();
