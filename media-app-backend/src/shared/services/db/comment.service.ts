import { Types } from 'mongoose';

import {
  ICommentDocument,
  ICommentJob,
  ICommentNameList,
  IQueryComment,
} from '@comment/interfaces/comments.interface';
import { CommentsModel } from '@comment/models/comments.model';
import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.model';
import { PostModel } from '@post/models/post.model';
import { UserCache } from '@service/redis/user.cache';

const userCache = new UserCache();

class CommentService {
  public async addPostCommentToDb(commentData: ICommentJob) {
    const { postId, comment, userTo, userFrom, username } = commentData;
    const createComment = CommentsModel.create(comment);
    const updatePost = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    );
    const user = userCache.getUserFromCache(userTo);
    const response = await Promise.all([createComment, updatePost, user]);

    if (response[2]?.notifications?.comments && userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: new Types.ObjectId(postId),
        createdItemId: new Types.ObjectId(response[0]._id!),
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1]?.post || '',
        imgId: response[1]?.imgId || '',
        imgVersion: response[1]?.imgVersion || '',
        gifUrl: response[1]?.gifUrl || '',
        reaction: '',
      });
    }
  }

  public async getPostCommentsFromDb(query: IQueryComment, sort: Record<string, 1 | -1>) {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
    return comments;
  }

  public async getPostCommentNamesFromDb(query: IQueryComment, sort: Record<string, 1 | -1>) {
    const commentsNamesList: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
      { $project: { _id: 0 } },
    ]);
    return commentsNamesList;
  }
}

export const commentService = new CommentService();
