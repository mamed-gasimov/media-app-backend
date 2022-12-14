import { model, Schema } from 'mongoose';

import { IReactionDocument } from '@reaction/interfaces/reaction.interface';

const reactionSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', index: true },
  type: { type: String, default: '' },
  username: { type: String, default: '' },
  avataColor: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() },
});

const ReactionModel = model<IReactionDocument>('Reaction', reactionSchema, 'Reaction');

export { ReactionModel };
