import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.model';
import { UserModel } from '@user/models/user.model';

class PostService {
  public async addPostToDb(userId: string, createdPost: IPostDocument) {
    const post = PostModel.create(createdPost);
    const user = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([post, user]);
  }
}

export const postService = new PostService();
