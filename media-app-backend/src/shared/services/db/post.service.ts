import { IGetPostsQuery, IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.model';
import { UserModel } from '@user/models/user.model';

class PostService {
  public async addPostToDb(userId: string, createdPost: IPostDocument) {
    const post = PostModel.create(createdPost);
    const user = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([post, user]);
  }

  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>) {
    const posts: IPostDocument[] = await PostModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ]);
    return posts;
  }

  public async postCount() {
    return PostModel.find({}).countDocuments();
  }

  public async findPostById(postId: string) {
    return PostModel.findOne({ _id: postId }).exec();
  }

  public async deletePost(postId: string, userId: string) {
    const deletePost = PostModel.deleteOne({ _id: postId });
    const decrementPostCount = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
    await Promise.all([deletePost, decrementPostCount]);
  }

  public async updatePost(postId: string, updatedPost: IPostDocument) {
    await PostModel.updateOne({ _id: postId }, { $set: updatedPost });
  }
}

export const postService = new PostService();
