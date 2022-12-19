import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comments.interface';
import { CommentsModel } from '@comment/models/comments.model';
import { PostModel } from '@post/models/post.model';
import { UserCache } from '@service/redis/user.cache';

const userCache = new UserCache();

class CommentService {
  public async addPostCommentToDb(commentData: ICommentJob) {
    const { postId, comment, userTo, userFrom, username } = commentData;
    const createComment = CommentsModel.create(comment);
    const updatePost = PostModel.findOneAndUpdate({ _id: postId }, { $inc: { commentsCount: 1 } }, { new: true });
    const user = userCache.getUserFromCache(userTo);
    const response = await Promise.all([createComment, updatePost, user]);
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
