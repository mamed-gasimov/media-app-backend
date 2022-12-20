import { model, Schema } from 'mongoose';

import { IFollowerDocument } from '@follower/interfaces/follower.interface';

const followerSchema = new Schema({
  followerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  followeeId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  createdAt: { type: Date, default: Date.now() },
});

const FollowerModel = model<IFollowerDocument>('Follower', followerSchema, 'Follower');
export { FollowerModel };
