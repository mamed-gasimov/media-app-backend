import { model, Schema } from 'mongoose';

import { ICommentDocument } from '@comment/interfaces/comments.interface';

const commentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', index: true },
  comment: { type: String, default: '' },
  username: { type: String },
  avataColor: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now() },
});

const CommentsModel = model<ICommentDocument>('Comment', commentSchema, 'Comment');
export { CommentsModel };
